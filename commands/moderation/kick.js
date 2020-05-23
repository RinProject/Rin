module.exports = {
	async run(message) {
		if (message.mentions.members.first()) {
			message.mentions.members.tap(member => {
				if (message.guild.me.hasPermission('KICK_MEMBERS')) {
					member.kick().then(() => {
						message.channel.send('', {
							embed: {
								title: `${member.user.tag} has been kicked by ${message.author.tag}.`,
								color: 0x00FF00
							}
						});
					}
					).catch(() => {
						message.channel.send('', {
							embed: {
								title: `${member.user.tag} was not kicked. Reason: unknown.`,
								color: 0xFF0000
							}
						})
					})
				} else {
					message.channel.send('', {
						embed: {
							title: `${member.user.tag} was not kicked. Reason: Member cannot be kicked by bot. Check my status in the servers role hierarchy.`,
							color: 0xFF0000
						}
					});
				}
			});
		} else {
			message.channel.send('', {
				embed: {
					title: `Please mention users to kick.`,
					color: 0xFF0000
				}
			});
		}
	},
	description: 'Kicks a user',
	detailed: 'Kicks all users mentioned',
	examples: prefix => `${prefix}kick @someone1, @someone2, @someone3`,
	name: 'kick',
	perms: [`KICK_MEMBERS`]
}
