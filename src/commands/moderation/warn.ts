import { TextChannel } from 'discord.js';
import { command } from '../../core';
import { Guild } from '../../database';

const crypto = require('crypto');
const warn: command = {
	async run(message, args, colors) {
		const member =
			message.mentions.members.first() || (await message.guild.members.cache.get(args[1]));
		const reason = args.slice(2).join(' ');
		const g = await Guild.findOne({ id: message.guild.id });

		if (reason && member) {
			const timestamp = +new Date();
			const id = crypto
				.createHash('md5')
				.update(timestamp.toString(16))
				.digest('hex')
				.substring(22);

			g.warnings.push({
				id,
				user: member.id,
				moderator: message.author.id,
				reason,
				timestamp,
				active: true,
			});
			g.save();

			message.client.emit(
				'warning',
				message.guild,
				member,
				timestamp,
				reason,
				message.member,
				message.channel as TextChannel
			);

			message.channel.send({
				embed: {
					title: `${member.user.tag} has been warned`,
					color: colors.negative,
					thumbnail: {
						url: member.user.displayAvatarURL(),
					},
					description: `**Reason:** ${reason}`,
					footer: {
						text: `Warning id: ${id} | warned by ${message.author.tag}`,
						iconURL: message.author.displayAvatarURL(),
					},
					timestamp: timestamp,
				},
			});
		} else if (args[1] == 'remove' && args[2]) {
			const index = g.warnings.findIndex((mute) => mute.id === args[2]);

			if (index === undefined) {
				message.channel.send({
					embed: {
						title: '404 mute not found',
						description: 'Make sure you got the id of the mute right.',
						color: colors.error,
					},
				});
				return;
			}

			g.warnings[index].active = false;
			g.save();

			message.channel.send({
				embed: {
					title: 'Warning removed',
					description: `Warning ${args[2]}`,
					color: colors.success,
				},
			});
		} else if (args[1] == 'restore' && args[2]) {
			message.channel.send({
				embed: {
					title: 'Warning restored',
					description: `Warning: ${args[2]}`,
					color: colors.negative,
				},
			});
		} else
			message.channel.send({
				embed: {
					title: 'Incorrect command usage',
					description: `Correct syntax is:\n\`${this.examples}\``,
					color: colors.error,
				},
			});
	},
	description: 'Warns a user',
	detailed: 'Warns mentioned user and can also remove/restore warnings.',
	examples: [
		(prefix) => `${prefix}warn @Tarren#9722 Being a chuckle fuck`,
		(prefix) =>	`${prefix}warn 571487483016118292 writing bad code`,
		(prefix) =>	`${prefix}warn remove 6a6169c312`,
		(prefix) =>	`${prefix}warn restore 6a6169c312`
	],
	name: 'Warn',
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true,
};

export = warn;
