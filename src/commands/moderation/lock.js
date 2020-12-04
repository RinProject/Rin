module.exports = {
	async run(message, args, colors) {
		if (args[1] != 'off') {
			message.channel
				.createOverwrite(
					message.guild.roles.everyone,
					{ SEND_MESSAGES: false },
					`Channel locked by ${message.author.tag}`
				)
				.then(() => {
					message.channel.send('', {
						embed: {
							title: 'Channel Locked',
							color: colors.negative,
						},
					});
				});
		} else {
			message.channel
				.createOverwrite(
					message.guild.roles.everyone,
					{ SEND_MESSAGES: null },
					`Channel unlocked by ${message.author.tag}`
				)
				.then(() => {
					message.channel.send('', {
						embed: {
							title: 'Channel Unlocked',
							color: colors.success,
						},
					});
				});
		}
	},
	description: 'Locks a channel',
	detailed: 'Overwrites permissions to speak in channel it is called in.',
	examples: [
		(prefix) => `${prefix}lock`,
		(prefix) => `${prefix}lock off`
	],
	name: 'Lock',
	permissions: ['MANAGE_CHANNELS'],
	botPermissions: ['MANAGE_CHANNELS'],
	guildOnly: true,
};
