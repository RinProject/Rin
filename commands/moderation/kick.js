module.exports = {
	async run(message, args) {
			let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]);
			if (member == undefined) {
				return message.channel.send('', {
					embed: {
						"title" : "Mention a user to kick",
						"color" : 0xFF0000
					}
				});
			}
			else {
					member.kick().then(() => {
						message.channel.send('', {
							embed: {
								"title" : `${member.user.tag} has been kicked by ${message.author.tag}.`,
								"color" : 0x00FF00
							}
						});
					})
			}
	},
	description: 'Kicks a user',
	detailed: 'Kicks mentioned user',
	examples: prefix => `${prefix}kick @someone, ${prefix}kick <id>`,
	name: 'kick',
	perms: [`KICK_MEMBERS`]
}
