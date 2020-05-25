module.exports = {
	async run(message, args) {
	// Check if bot has permissions to ban users
        if(!message.guild.me.hasPermission("BAN_MEMBERS")) {
            return message.channel.send('', {
				embed: {
						"title" : "An error occurred.",
						"description": "I require the **ban members** permission to ban users.",
						"color" : 0xFF0000
				}
			})
        }
			let member = message.mentions.users.first() || await message.client.users.fetch(args[1])
			.catch(e => {
				if (e) {
				    message.channel.send('', {
					embed: {
							"title" : "Please provide a user to ban.",
							"color" : 0xFF0000
					}
				})}
			})

			if (member == undefined)
			{
				return;
			}

			if(!member.bannable) {
				return message.channel.send('', {
				embed: {
						"title" : "An error occurred.",
						"description": "The bot is unable to ban the given user, please check it's position in the hierarchy.",
						"color" : 0xFF0000
				}
			})}

			else {
					message.guild.members.ban(member, 0).then(() => {
						message.channel.send('', {
							embed: {
									"title" : `${member.tag} has been banned by ${message.author.tag}.`,
									"color" : 0x00FF00
							}
						});
					})}
	},
	description: 'Bans a user',
	detailed: 'Bans a user by ID or mention.',
	examples: prefix => `${prefix}ban @someone, ${prefix}ban <id>`,
	name: 'ban',
	perms: ['BAN_MEMBERS']
}
