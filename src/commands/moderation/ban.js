module.exports = {
	async run(message, args) {
		let reason = args.slice(2).join(" ");
		if (!reason) reason = `No reason provided. Responsible moderator: ${message.author.tag}`;
		
		// TODO: implement optional message remove days functionality, logging reason/responsible moderator functionality
		let user = message.mentions.users.first() || await message.client.users.fetch(args[1])
		.catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Please provide a user to ban.',
					color: colors.error
				}
			});
		});

		if(user == undefined) return;

		message.guild.members.ban(user, {days: 0, reason: reason}).then(()=>{
			message.channel.send('', {
				embed: {
					title: 'User successfully banned',
					description: `${user.tag} has been banned by ${message.author.tag}.`,
					color: colors.negative,
					footer: {
						text: `id: ${user.id}`
					}
				}
			});
		}).catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Failed to ban user.',
					color: colors.error
				}
			});
		});
	},
	description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone, ${prefix}ban <id>`,
	name: 'ban',
	perms: ['BAN_MEMBERS'],
	botPerms: ['BAN_MEMBERS'],
	guildOnly: true
}
