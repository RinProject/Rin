const images = require('../../JSONStorage/kiss.json')
module.exports = {
	run: async function (message) {
		if(message.mentions.users.first())
			message.channel.send('', {
				embed: {
					title: `${message.mentions.users.first().username} has been kissed by ${message.author.username}`,
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
					description: 'It appears the person you have tried to kiss does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Kisses a user',
	detailed: 'Kisses first mentioned user',
	examples: prefix => `${prefix}kiss @someone`,
	name: 'kiss',
	perms: null,
};
