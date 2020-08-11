const images = require('../../JSONStorage/bonk.json')
module.exports = {
	run: async function (message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		
		if(member) {
		if (message.author.id == member.user.id) {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has bonked themselves`,
					description: `Are you a masochist?`,
					color: 0xff80cc,
					image: {
						url: images[Math.floor(Math.random() * images.length)]
					}
				}
			})
		}

		else {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has been bonked by ${message.author.tag}`,
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
					description: 'It appears the person you have tried to bonk does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Bonks a user',
	detailed: 'Bonks first mentioned user',
	examples: prefix => `${prefix}bonk @member`,
	name: 'bonk',
	perms: null,
	guildOnly: true
};
