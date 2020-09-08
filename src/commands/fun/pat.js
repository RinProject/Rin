const images = require('../../../JSONstorage/pat.json')
module.exports = {
	run: async function (message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		
		if(member) {
		if (message.author.id == member.user.id) {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has been patted by ${message.client.user.tag}`,
					description: `I patted you because I felt bad, there's nothing more to this.`,
					color: colors.base,
					image: {
						url: images[Math.floor(Math.random() * images.length)]
					}
				}
			})
		}

		else {
			return message.channel.send('', {
				embed: {
					title: `${member.user.tag} has been patted by ${message.author.tag}`,
					color: colors.base,
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
					description: 'It appears the person you have tried to pat does not exist.',
					color: colors.error
				}
			});
	},
	description: 'Pats a user',
	detailed: 'Pats first mentioned user',
	examples: prefix => `${prefix}pat @member`,
	name: 'pat',
	perms: null,
	guildOnly: true
};
