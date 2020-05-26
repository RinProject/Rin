const images = require('../../JSONStorage/pat.json')
module.exports = {
	run: async function (message) {
		if(message.mentions.users.first())
			message.channel.send('', {
				embed: {
					title: `${message.mentions.users.first().username} has been patted by ${message.author.username}`,
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
					description: 'it appears the person you have tried to pat does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Pats a user',
	detailed: 'Pats first mentioned user',
	examples: prefix => `${prefix}pat @someone`,
	name: 'pat',
	perms: null,
};
