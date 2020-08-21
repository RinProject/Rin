const images = require('../../JSONStorage/hug.json')
module.exports = {
	run: async function (message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		
		if(member) {
		if (message.author.id == member.user.id) {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has been hugged by ${message.client.user.tag}`,
					description: `You tried to hug yourself? Don't worry, it'll be okay.`,
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
					title: `${member.user.tag} has been hugged by ${message.author.tag}`,
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
					description: 'It appears the person you have tried to hug does not exist.',
					color: 0xff0000
				}
			});
	},
	description: 'Hugs a user',
	detailed: 'Hugs first mentioned user',
	examples: prefix => `${prefix}hug @member`,
	name: 'hug',
	perms: null,
	guildOnly: true
};
