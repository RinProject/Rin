module.exports = {
	async run(message, args) {
		let user = message.mentions.users.first() || await message.client.users.fetch(args[1])
		.catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Please provide a user to ban.',
					color: 0xCC1020
				}
			});
		});

		if(user == undefined) {
			return;
		}

		message.guild.members.ban(user, 0).then(()=>{
			message.channel.send('', {
				embed: {
					title: 'User successfully banned',
					description: `${user.tag} has been banned by ${message.author.tag}.`,
					color: 0x10CC10,
					footer: {
						text: `id: ${user.id}`
					}
				}
			});
		}).catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Failed to ban user.',
					color: 0xCC1020
				}
			});
		});
	},
	description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone, ${prefix}ban <id>`,
	name: 'ban',
	perms: ['BAN_MEMBERS'],
	botPerms: ['BAN_MEMBERS']
}
