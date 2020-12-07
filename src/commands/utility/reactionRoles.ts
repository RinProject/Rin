import { Guild } from '../../database';
import { Command } from '../../core';

export = new Command({
	run: async function (message, args, colors) {
		if (args[1] == undefined) {
			message.channel.send('', {
				embed: {
					color: colors.error,
					description: `Please follow the format ${message.client.prefix()}reactrole add <messageID> <emojiID> <roleID> or ${message.client.prefix()}reactrole remove <messageID> <emojiID>.`,
				},
			});
			return;
		}

		const messageId = args[2];
		const emojiId = args[3];
		const roleId = args[4];

		if (args[1] == 'add') {
			if (messageId == undefined || emojiId == undefined || roleId == undefined) {
				message.channel.send('', {
					embed: {
						color: colors.error,
						description: `Please follow the format ${message.client.prefix()}reactrole add <messageID> <emojiID> <roleID>.`,
					},
				});
				return;
			}
			const g = await Guild.findOne({ id: message.guild.id });
			g.reactionRoles.set(messageId + emojiId, roleId);
			g.save();

			message.channel.messages
				.fetch(messageId)
				.then((msg) => {
					msg.react(emojiId);
				})
				.then(() => message.channel.send('Reaction role added'))
				.catch(() =>
					message.channel.send({
						embed: {
							color: colors.error,
							description: `An error occurred ensure you used the right ids in the right order, \`${message.client.prefix()}reactrole add <messageID> <emojiID> <roleID>\`.`,
						},
					})
				);
		}
		if (args[1] == 'remove') {
			if (messageId == undefined || emojiId == undefined) {
				message.channel.send({
					embed: {
						color: colors.error,
						description: `Please follow the format ${message.client.prefix()}reactrole remove <messageID> <emojiID>`,
					},
				});
				return;
			}
			const g = await Guild.findOne({ id: message.guild.id });
			g.reactionRoles.delete(messageId + emojiId);
			g.save();

			message.channel.send('', {
				embed: {
					color: colors.base,
					description: `Reaction role successfully deleted`,
				},
			});
		}
	},
	aliases: ['rr', 'ReactRole'],
	description: 'Add or remove a react role.',
	detailed: 'Add a react role to a message, or remove a react role from a message.',
	examples: [
		(prefix) => `${prefix}reactrole add <messageID> <emojiID> <roleID>`,
		(prefix) => `${prefix}reactrole remove <messageID> <roleID>`,
	],
	name: 'ReactionRole',
	permissions: ['MANAGE_ROLES'],
});
