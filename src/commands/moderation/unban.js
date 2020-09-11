module.exports = {
	async run(message, args, colors) {
		let bans = await message.guild.fetchBans();
		let bannedPerson = bans.get(args[1]);
		
		if(bannedPerson == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Please provide a user ID to unban.',
					color: colors.error
				}
			});
		}

		let reason = args.slice(2).join(" ");
		if (!reason) reason = `No reason provided. Responsible moderator: ${message.author.tag}`;

		try {
			message.guild.members.unban(bannedPerson.user.id, reason);
			message.channel.send('', {
				embed: {
					title: 'User successfully unbanned',
					description: `${bannedPerson.user.tag} is no longer banned.`,
					color: colors.success,
					footer: {
						text: `id: ${bannedPerson.user.id}`
					}
				}
			});
		} catch (e) {
				return message.channel.send('', {
					embed: {
						title: 'Failed to unban user.',
						color: colors.error
					}
				});
		}
	},
	description: 'Unbans a user',
	detailed: 'Unbans mentioned user',
	examples: prefix => `${prefix}unban <id>`,
	name: 'unban',
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true
}
