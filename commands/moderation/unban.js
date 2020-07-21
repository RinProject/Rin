module.exports = {
	async run(message, args) {
		let bans = await message.guild.fetchBans();
		let bannedPerson = bans.get(args[1]);
		
		if(bannedPerson == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Please provide a user ID to unban.',
					color: 0xFF0000
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
					color: 0x10CC10,
					footer: {
						text: `id: ${bannedPerson.user.id}`
					}
				}
			});
		} catch (e) {
				return message.channel.send('', {
					embed: {
						title: 'Failed to unban user.',
						color: 0xCC1020
					}
				});
		}
	},
	description: 'Unbans a user',
	detailed: 'Unbans mentioned user',
	examples: prefix => `${prefix}unban <id>`,
	name: 'unban',
	perms: ['BAN_MEMBERS'],
	botPerms: ['BAN_MEMBERS'],
	guildOnly: true
}
