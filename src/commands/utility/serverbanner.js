const options = require('../../../JSONstorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);
module.exports = {
	async run(message, args, colors) {
		if (message.guild.bannerURL())
			return message.channel.send('', {
				embed: {
					title: `Server banner for ${message.guild.name}`,description: `[Server Banner URL](${message.guild.bannerURL({format: "png", size: 512, dynamic: true})})`,
					color: colors.base,
					image: {
						url: message.guild.bannerURL({
							format: "png",
							size: 512,
							dynamic: true
						}),
						height: 512, 
						width: 512
					}
				}
			});
		else 
			return message.channel.send('', {
				embed: {
					title: 'An error has occurred.',
					description: 'It appears this server does not have a banner.',
					color: colors.error
				}
			});
	},
	aliases: ['banner'],
	description: 'Returns a server banner',
	detailed: 'Returns a server banner',
	examples: prefix => `${prefix}serverbanner`,
	name: 'serverbanner',
    guildOnly: true
}