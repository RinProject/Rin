module.exports = {
	async run(message, args, colors) {
		if (message.guild.bannerURL())
			return message.channel.send('', {
				embed: {
					title: `Server banner for ${message.guild.name}`,
					description: `[Server Banner URL](${message.guild.bannerURL({
						format: 'png',
						size: 512,
						dynamic: true,
					})})`,
					color: colors.base,
					image: {
						url: message.guild.bannerURL({
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
					description: 'It appears this server does not have a banner.',
					color: colors.error,
				},
			});
	},
	aliases: ['Banner'],
	description: 'Displays the banner of a server.',
	detailed: 'Displays the banner of a server.',
	examples: (prefix) => `${prefix}serverbanner`,
	name: 'ServerBanner',
	guildOnly: true,
};
