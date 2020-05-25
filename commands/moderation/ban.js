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
			let user = message.mentions.users.first() || await message.client.users.fetch(args[1])
			.catch(e => {
				if (e) {
				    message.channel.send('', {
					embed: {
							"title" : "Please provide a user to ban.",
							"color" : 0xFF0000
					}
				})}
			})

			if (user == undefined)
			{
				return;
			}
			
					message.guild.members.ban(user, 0).then(() => {
						message.channel.send('', {
							embed: {
									"title" : `${user.tag} has been banned by ${message.author.tag}.`,
									"color" : 0x00FF00
							}
						}).catch(e => {
							if (e) {
								return message.channel.send('', {
									embed: {
											"title" : "An error occurred.",
											"description": "The bot is unable to ban the given user, please check it's position in the hierarchy.",
											"color" : 0xFF0000
									}
								})
							}
						});
					})
	},
	description: 'Bans a user',
	detailed: 'Bans a user by ID or mention.',
	examples: prefix => `${prefix}ban @someone, ${prefix}ban <id>`,
	name: 'ban',
	perms: ['BAN_MEMBERS']
}
