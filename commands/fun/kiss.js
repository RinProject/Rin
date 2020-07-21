const images = require('../../JSONStorage/kiss.json')
module.exports = {
	run: async function (message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		
		if(member) {
		if (message.author.id == member.user.id) {
			return message.channel.send('', {
				embed: {
					title: `I can't help you kiss yourself.`,
					description: `Sorry to break it to you, but I don't have a mirror for you to kiss yourself in. Kiss someone else.`,
					color: 0xff0000
				}
			});
		}

		else {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has been kissed by ${message.author.tag}`,
					color: 0xff80cc,
					image: {
						url: images[Math.floor(Math.random() * images.length)]
					}
				}
			})}

		}
		else
			return message.channel.send('', {
				embed: {
					title: 'An error has occurred',
					description: 'It appears the person you have tried to kiss does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Kisses a user',
	detailed: 'Kisses first mentioned user',
	examples: prefix => `${prefix}kiss @member`,
	name: 'kiss',
	perms: null,
};
