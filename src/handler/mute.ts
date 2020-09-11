const sqlite3 = require('sqlite3').verbose();

import * as Discord from 'discord.js';

import { asyncDB } from './utils';

let client: Discord.Client;

const { get, run, all } = asyncDB;

let db = new sqlite3.Database(`${__dirname}/store.db`, (err) => {
	if (err) {
		return console.error(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS mutes(guild TEXT NOT NULL, member TEXT NOT NULL, ends TEXT NOT NULL, reason TEXT NOT NULL, moderator TEXT NOT NULL);');

db.run('CREATE TABLE IF NOT EXISTS muteRole(guild TEXT UNIQUE NOT NULL, role TEXT NOT NULL);');

let checkingMutes = false;

type Mute = {
	member?: string;
	guild?: string;
	ends?: string;
	reason?: string;
	moderator?: string;
};

type Role = {
	role?: string;
	guild?: string;
}

export const mute = {
	mute: async function (guild: Discord.Guild, member: Discord.GuildMember, time: number, reason: string, moderator: Discord.GuildMember, channel?: Discord.TextChannel){
		let mute: Mute = await get(db, 'SELECT member FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(mute&&mute.member)
			throw 'User Already Muted';
		let r: Role = await get(db, 'SELECT role FROM muteRole WHERE guild = (?);', [guild.id]);

		let role: Discord.Role;
		if(r)
			role = guild.roles.resolve(r.role);
		
		if(!role){
			role = await guild.roles.create({
				data: {
					name: 'Muted',
					color: 'GREY',
					permissions: 0
				},
				reason: 'Auto generated mute role'
			});
			await guild.channels.cache.each(async(channel) => {
				if(channel.type==='text')
					await channel.createOverwrite(role, {
						SEND_MESSAGES: false
					}).catch();
				else if(channel.type==='voice')
					await channel.createOverwrite(role, {
						SPEAK: false
					}).catch();
			});
			await run(db, 'INSERT OR REPLACE INTO muteRole(guild, role) VALUES((?), (?));', [guild.id, role.id]);
		}
		if(!reason)
			reason = 'No reason provided.';
		member.roles.add(role, `Muted by ${moderator.user.tag}(id: ${moderator.id}) for "${reason}"`);
		await run(
			db,
			'INSERT OR REPLACE INTO mutes(member, guild, reason, ends, moderator) VALUES((?), (?), (?), (?), (?));',
			[member.id, guild.id, reason, time||'inf', moderator.id]
		);
		let logChannel = await get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [guild.id])
		if (logChannel && logChannel.modLogChannel)
			//@ts-ignore
			guild.channels.resolve(logChannel.modLogChannel).send({embed:{
				title: 'User muted',
				description: `${member.toString()} muted by ${moderator.toString()}\n\nReason:\n${reason}`,
				color: 0xFF4040,
				footer: {
					text: time?'Mute ending':'Mute indefinite'
				},
				timestamp: time
			}});
	},
	unmute: async function(guild: Discord.Guild, member: Discord.GuildMember): Promise<void>{
		let role: Role = await get(db, 'SELECT role FROM muteRole WHERE guild = (?);', [guild.id]);
		await run(db, 'DELETE FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(!role)
			throw 'No muted role found';
		if(!member.roles.cache.get(role.role))
			throw 'User not muted';
		member.roles.remove(role.role, 'Mute time over');

		let logChannel: any = await get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [guild.id])
		if (logChannel && logChannel.modLogChannel)
			//@ts-ignore
			guild.channels.resolve(logChannel.modLogChannel).send({embed:{
				title: 'User unmuted',
				description: `${member.toString()} unmuted`,
				color: 0x80FF80
			}});
	}
};

setInterval(checkMutes, 30000);

async function checkMutes(){
	const toUnmute = await all(db, 'SELECT * FROM mutes WHERE ends < (?);', [+new Date]);
	toUnmute.forEach(async (currentMute) =>{
		let guild = client.guilds.resolve(currentMute.guild);
		let member;
		try {
			member = guild.members.resolve(currentMute.member);
		} catch (e) {}
		if(!guild || !member)
			return run(db, 'DELETE FROM mutes WHERE guild = (?) AND member = (?);', [currentMute.guild, currentMute.member]);
		mute.unmute(guild, member).catch(e=>{});
	});
}

export function setClient(c: Discord.Client): void{
	client =  c;
}