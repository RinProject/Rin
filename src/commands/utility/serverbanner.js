const options = require('../../JSONStorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);
module.exports = {
	async run(message, args) {
		message.channel.send('', {
            embed: {
                title: `Server icon for ${message.guild.name}`,description: `[Server Banner URL](${message.guild.bannerURL({format: "png", size: 512, dynamic: true})})`,
				color: 0xFF80CC,
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
	},
	aliases: ['banner'],
	description: 'Returns a server banner',
	detailed: 'Returns a server banner',
	examples: prefix => `${prefix}serverbanner`,
	name: 'serverbanner',
	perms: null,
    guildOnly: true
}