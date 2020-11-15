import * as Discord from 'discord.js';
import { Client } from './client';
import { Guild, Mute } from '../database';
import { IMuteSchema } from '../database.schema';

let client: Client;

export type Role = {
	role?: string;
	guild?: string;
};

export async function mute(
	guild: Discord.Guild,
	member: Discord.GuildMember,
	time: number,
	reason: string,
	moderator: Discord.GuildMember,
	channel?: Discord.Channel
): Promise<void> {
	const m: IMuteSchema | null = await Mute.findOne({
		member: member.id,
		guild: guild.id,
	}).exec();
	if (m && m.member) throw new Error('User Already Muted');

	const r = await await Guild.findOne({ id: guild.id });

	let role: Discord.Role;
	if (r && r.muteRole) role = guild.roles.resolve(r.muteRole);

	if (!role) {
		role = await guild.roles.create({
			data: {
				name: 'Muted',
				color: 'GREY',
				permissions: 0,
			},
			reason: 'Auto generated mute role',
		});
		await guild.channels.cache.each(async (channel) => {
			if (channel.type === 'text')
				await channel
					.createOverwrite(role, {
						SEND_MESSAGES: false,
					})
					.catch();
			else if (channel.type === 'voice')
				await channel
					.createOverwrite(role, {
						SPEAK: false,
					})
					.catch();
		});
		await Guild.findOne({ id: guild.id }, async (err, g) => {
			if (err) throw err;
			await g.update({ muteRole: role.id }).exec();
			g.save();
		});
	}
	if (!reason) reason = 'No reason provided.';
	member.roles.add(role, `Muted by ${moderator.user.tag}(id: ${moderator.id}) for "${reason}"`);
	const mute = new Mute({
		guild: guild.id,
		member: member.id,
		ends: time || Infinity,
		reason: reason,
		moderator: moderator.id,
	});
	mute.save();
	guild.client.emit('mute', guild, member, time, reason, moderator, channel);
}

export async function unmute(
	guild: Discord.Guild,
	member: Discord.GuildMember,
	reason?: string
): Promise<void> {
	const g = await Guild.findOne({ id: guild.id }).exec();

	await Mute.remove({ guild: guild.id, member: member.id });
	if (!g.muteRole) throw new Error('No muted role found');
	if (!member.roles.cache.get(g.muteRole)) throw new Error('User not muted');
	member.roles.remove(g.muteRole, reason || 'User unmuted');

	guild.client.emit('unmute', guild, member);
}

export async function getMute(
	guild: Discord.Guild,
	member: Discord.GuildMember
): Promise<IMuteSchema> {
	return new Promise((resolve, reject) => {
		Mute.findOne({ guild: guild.id, member: member.id }, (err, mute) => {
			if (err) reject(err);
			else resolve(mute);
		});
	});
}

async function checkMutes() {
	const toUnmute = await Mute.find()
		.where('ends')
		.lt(+new Date());
	toUnmute.forEach(async (currentMute) => {
		const guild = client.guilds.resolve(currentMute.guild);
		let member: Discord.GuildMember;

		try {
			member = guild.members.resolve(currentMute.member);
		} catch (e) {
			e;
		}

		if (guild && member) {
			const g = await Guild.findOne({ id: guild.id }).exec();
			member.roles.remove(g.muteRole, 'Automatic unmute');
		}
		client.emit('unmute', guild, member);
		currentMute.deleteOne();
	});
}

export function start(c: Client): void {
	client = c;
	setInterval(checkMutes, 30000);
}
