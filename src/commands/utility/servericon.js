const options = require('../../JSONStorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);
module.exports = {
	async run(message, args) {
		message.channel.send('', {
            embed: {
                title: `Server icon for ${message.guild.name}`,description: `[Server Icon URL](${message.guild.iconURL({format: "png", size: 512, dynamic: true})})`,
				color: colors.base,
				image: {
					url: message.guild.iconURL({
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
	aliases: ['icon'],
	description: 'Returns a server icon',
	detailed: 'Returns a server icon',
	examples: prefix => `${prefix}servericon`,
	name: 'servericon',
	perms: null,
    guildOnly: true
}