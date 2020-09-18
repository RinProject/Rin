const sqlite3 = require('sqlite3').verbose();

import * as Discord from 'discord.js';
import { Client } from './index';
import { asyncDB } from './utils';

let client: Client;

const { get, run, all } = asyncDB;

let db = new sqlite3.Database(`${__dirname}/store.db`, (err) => {
	if (err) {
		return console.error(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS mutes(guild TEXT NOT NULL, member TEXT NOT NULL, ends TEXT NOT NULL, reason TEXT NOT NULL, moderator TEXT NOT NULL);');

db.run('CREATE TABLE IF NOT EXISTS muteRole(guild TEXT UNIQUE NOT NULL, role TEXT NOT NULL);');

let checkingMutes = false;

export type Mute = {
	member: string;
	guild: string;
	ends: string;
	reason: string;
	moderator: string;
};

export type Role = {
	role?: string;
	guild?: string;
}

export const mute = {
	mute: async function (guild: Discord.Guild, member: Discord.GuildMember, time: number, reason: string, moderator: Discord.GuildMember, channel?: Discord.TextChannel){
		let mute: Mute | null = await get(db, 'SELECT member FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(mute&&mute.member)
			throw new Error('User Already Muted');
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
		client.emit('mute', guild, member, time, reason, moderator);
	},
	unmute: async function(guild: Discord.Guild, member: Discord.GuildMember): Promise<void>{
		let role: Role = await get(db, 'SELECT role FROM muteRole WHERE guild = (?);', [guild.id]);
		await run(db, 'DELETE FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(!role)
			throw new Error('No muted role found');
		if(!member.roles.cache.get(role.role))
			throw new Error('User not muted');
		member.roles.remove(role.role, 'Mute time over');

		client.emit('unmute', guild, member);
	},
	getMute: async function (guild: Discord.GuildResolvable, member: Discord.GuildMemberResolvable): Promise<Mute> {
		return new Promise((resolve, reject)=>{
			let g = client.guilds.resolve(guild);
			if(!g)
				reject(new Error('Invalid guild'));
			let m = g.members.resolve(member);
			get(db, 'SELECT member FROM mutes WHERE guild = (?) AND member = (?);', [g.id, m.id||null])
				.then(resolve)
				.catch(reject);
		});
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

export function setClient(c: Client): void{
	client =  c;
}