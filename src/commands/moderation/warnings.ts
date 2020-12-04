import { command } from '../../core';
import { Guild } from '../../database';

const options = require('../../../JSONstorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);

const warnings: command = {
	async run(message, args, colors) {
		if (args[1]) {
			const member =
				message.mentions.members.first() || (await message.guild.members.fetch(args[1]));
			if (member) {
				const g = await Guild.findOne({ id: message.id });
				const warnings = g.warnings.filter((v) => v.user === member.id);
				if (!warnings[0]) {
					message.channel.send({
						embed: {
							title: 'No warnings found',
							color: colors.success,
							description: 'It seems the provided user has no warnings',
						},
					});
					return;
				}
				const fields = [];
				let warningCount = 0;
				warnings.forEach((warning, i) => {
					fields.push({
						name: `Warning number ${i + 1}${warning.active ? '' : ' (redacted warning)'}`,
						value: `**Reason:** ${warning.reason}\n**Warning id:** ${
							warning.id
						}\n**Moderator**: <@${warning.moderator}>\n**Timestamp:** ${formatter.format(
							warning.timestamp
						)}`,
						inline: false,
					});
					if (warning.active) ++warningCount;
				});
				message.channel.send({
					embed: {
						title: `${member.displayName} has ${warnings} active warning${
							warningCount === 1 ? '' : 's'
						}`,
						color: colors.negative,
						thumbnail: {
							url: member.user.displayAvatarURL(),
						},
						description: member.user.toString(),
						fields: fields,
					},
				});
			} else {
				const g = await Guild.findOne({ id: message.id });
				const warning = g.warnings.find((v) => v.id === args[1]);
				if (warning) {
					message.channel.send({
						embed: {
							title: 'No warning found',
							description: 'It seems the provided warning does not exist.',
							color: colors.success,
						},
					});
					return;
				}
				const member = message.guild.members.cache.get(warning.user);
				const moderator = message.guild.members.cache.get(warning.moderator);
				message.channel.send({
					embed: {
						title: `${member.displayName} has been warned`,
						thumbnail: {
							url: member.user.displayAvatarURL(),
						},
						color: colors.negative,
						description: `**Reason:** ${warning.reason}`,
						fields: [
							{
								name: 'Moderator',
								value: `ID: ${moderator.id}\nName: ${moderator.user.tag}`,
								inline: true,
							},
							{
								name: 'Warned',
								value: `ID: ${member.id}\nName: ${member.user.tag}`,
								inline: true,
							},
						],
						footer: {
							text: `Warning id: ${member.id}`,
						},
						timestamp: warning.timestamp,
					},
				});
			}
		}
	},
	aliases: ['Warning'],
	description: 'Displays warnings and their ids of a user, or a specific warning',
	detailed: 'Displays warnings and their ids of a user, or a specific warning by using the ID of the warning',
	examples: [
		(prefix) => `${prefix}warnings @Tarren#9722`,
		(prefix) =>	`${prefix}warnings 157101769858613248`,
		(prefix) =>	`${prefix}warning [id]`
	],
	name: 'Warnings',
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true,
};

export = warnings;
