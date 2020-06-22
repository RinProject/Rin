const images = require('../../JSONStorage/bonk.json')
module.exports = {
	run: async function (message) {
		if(message.mentions.users.first())
			message.channel.send('', {
				embed: {
					title: `${message.mentions.users.first().username} has been bonked by ${message.author.username}`,
					color: 0xff80cc,
					image: {
						url: images[Math.floor(Math.random() * images.length)]
					}
				}
			});
		else
			message.channel.send('', {
				embed: {
					title: 'An error has occurred',
					description: 'It appears the person you have tried to bonk does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Bonks a user',
	detailed: 'Bonks first mentioned user',
	examples: prefix => `${prefix}bonk @someone`,
	name: 'bonk',
	perms: null,
	guildOnly: true
};
