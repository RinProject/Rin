module.exports = {
	async run(message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		if(member == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Mention a user to kick',
					color: colors.error
				}
			});
		}
		if(!member.kickable) {
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description: 'The bot is unable to kick the given user, please check it\'s position in the hierarchy.',
					color: colors.error
				}
			});
		}
		else {
			member.kick().then(() => {
				message.channel.send('', {
					embed: {
						title: `${member.user.tag} has been kicked by ${message.author.tag}.`,
						color: colors.negative
					}
				});
			});
		}
	},
	description: 'Kicks a user',
	detailed: 'Kicks mentioned user',
	examples: prefix => `${prefix}kick @someone, ${prefix}kick <id>`,
	name: 'kick',
	perms: ['KICK_MEMBERS'],
	botPerms: ['KICK_MEMBERS'],
	guildOnly: true
}
