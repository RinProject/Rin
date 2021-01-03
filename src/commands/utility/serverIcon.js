module.exports = {
	async run(message, args, colors) {
		if (message.guild.iconURL())
			return message.channel.send('', {
				embed: {
					title: `Server icon for ${message.guild.name}`,
					description: `[Server Icon URL](${message.guild.iconURL({
						format: 'png',
						size: 512,
						dynamic: true,
					})})`,
					color: colors.base,
					image: {
						url: message.guild.iconURL({
							format: 'png',
							size: 512,
							dynamic: true,
						}),
						height: 512,
						width: 512,
					},
				},
			});
		else
			return message.channel.send('', {
				embed: {
					title: 'An error has occurred.',
					description: 'It appears this server does not have an icon.',
					color: colors.error,
				},
			});
	},
	aliases: ['Icon'],
	description: 'Displays the icon of a server.',
	detailed: 'Displays the icon of a server.',
	examples: (prefix) => `${prefix}servericon`,
	name: 'ServerIcon',
	guildOnly: true,
};
