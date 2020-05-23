module.exports = {
	async run(message) {
		if (message.mentions.members.first()) {
			message.mentions.members.tap(member => {
				if (message.guild.me.hasPermission('BAN_MEMBERS')) {
					member.ban(0).then(() => {
						message.channel.send('', {
							embed: {
								title: `${member.user.tag} has been banned by ${message.author.tag}.`,
								color: 0x00FF00
							}
						});
					}
					).catch(() => {
						message.channel.send('', {
							embed: {
								title: `${member.user.tag} was not banned. Reason: unknown.`,
								color: 0xFF0000
							}
						})
					})
				} else {
					message.channel.send('', {
						embed: {
							title: `${member.user.tag} was not banned. Reason: Member cannot be banned by bot. Check my status in the servers role hierarchy.`,
							color: 0xFF0000
						}
					});
				}
			});
		} else {
			message.channel.send('', {
				embed: {
					title: `Please mention users to ban.`,
					color: 0xFF0000
				}
			});
		}
	},
	description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone1, @someone2, @someone3`,
	name: 'ban',
	perms: [`BAN_MEMBERS`]
}
