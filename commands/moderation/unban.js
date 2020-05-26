module.exports = {
	async run(message, args) {
		let bans = await message.guild.fetchBans();
		let bannedPerson = bans.get(args[1]);

		console.log(bannedPerson)
		if(bannedPerson == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Please provide a user ID to unban',
					color: 0xFF0000
				}
			});
		}
		let reason = args.slice(1).join(" ");
		if(!reason) {
			reason = "No reason provided";
		}
		try {
			message.guild.members.unban(bannedPerson.user.id, { Reason: reason });
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
			console.log(e.message);
		}
	},
	description: 'Unbans a user',
	detailed: 'Unbans mentioned user',
	examples: prefix => `${prefix}unban <user id>`,
	name: 'unban',
	perms: [`BAN_MEMBERS`]
}
