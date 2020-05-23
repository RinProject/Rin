module.exports = {
	async run(message, args) {
			let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
			if (member == undefined) {
				return message.channel.send('', {
					embed: {
							"title" : "Mention a user to ban",
							"color" : 0xFF0000
					}
				});
			}
			else {
					member.ban(0).then(() => {
						message.channel.send('', {
							embed: {
									"title" : `${member.user.tag} has been banned by ${message.author.tag}.`,
									"color" : 0x00FF00
							}
						});
					})
			}
	},
	description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone, ${prefix}ban <id>`,
	name: 'ban',
	perms: [`BAN_MEMBERS`]
}
