module.exports = {
	async run(message) {
		if (message.mentions.members.first()) {
			message.mentions.members.tap(member => {
				let membersRole = message.guild.roles.find('name', 'Cutie');
				if (!message.mentions.roles.has(membersRole.id)) {
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
							title: `${member.user.tag} was not kicked. Reason: Member cannot be kicked by bot.`,
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
