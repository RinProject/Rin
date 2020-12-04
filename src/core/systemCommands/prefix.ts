import { Command } from '../command';

export = new Command({
	run: async function (message, args, colors) {
		if (!args[1])
			message.channel.send({
				embed: {
					title: 'Current prefix is',
					description: message.client.prefixFor(message.guild.id),
					color: colors.base,
				},
			});
		else if (message.member.hasPermission('ADMINISTRATOR', { checkOwner: true }))
			message.client
				.setPrefix(message.guild.id, args[1])
				.then(() =>
					message.channel.send({
						embed: { title: 'Prefix set to', description: args[1], color: colors.success },
					})
				)
				.catch(() =>
					message.channel.send({
						embed: {
							title: 'Unable to set prefix',
							description: 'Internal error',
							color: colors.error,
						},
					})
				);
		else
			message.channel.send({
				embed: {
					title: 'Insufficient permissions',
					description: 'Only Administrators may change the prefix',
					color: colors.error,
				},
			});
	},
	description: 'Changes or displays the servers prefix',
	detailed: 'Change the prefix of the current server, display it, or reset it.',
	examples: [
		(prefix) => `${prefix}prefix`, 
		(prefix) => `${prefix}prefix :?`
	],
	name: 'Prefix',
	guildOnly: true,
});
