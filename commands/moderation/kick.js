module.exports = {
	async run(message, args) {
		// Check if bot has permissions to ban users
		if(!message.guild.me.hasPermission('KICK_MEMBERS')) {
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description: 'I require the **kick members** permission to kick users.',
					color: 0xFF0000
				}
			})
		}
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
		if(member == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Mention a user to kick',
					color: 0xFF0000
				}
			});
		}
		if(!member.kickable) {
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description: 'The bot is unable to kick the given user, please check it\'s position in the hierarchy.',
					color: 0xFF0000
				}
			});
		}
		else {
			member.kick().then(() => {
				message.channel.send('', {
					embed: {
						title: `${member.user.tag} has been kicked by ${message.author.tag}.`,
						color: 0x00FF00
					}
				});
			});
		}
	},
	description: 'Kicks a user',
	detailed: 'Kicks mentioned user',
	examples: prefix => `${prefix}kick @someone, ${prefix}kick <id>`,
	name: 'kick',
	perms: [`KICK_MEMBERS`]
}
