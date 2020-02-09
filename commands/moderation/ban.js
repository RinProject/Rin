module.exports = {
	async run(message) {
		if (message.mentions.members.size()){
			message.mentions.members.tap(member => {
				let membersRole = message.guild.roles.find('name', 'test');//Need to replace test with an actual role that should have immunity(mods/admins)
				if(!message.mentions.roles.has(membersRole.id)) {
					member.ban(0).then(() => {
						message.channel.send(newRichEmbed()
							.setColor('GREEN')
							.setTitle(`${member.user.tag} has been banned by ${message.author.tag}.`)
                            .setImage(message.mentions.avatarURL)
						);
					}).catch(() => {
						message.channel.send(new RichEmbed()
							.setColor('RED')
							.setTitle(`${member.user.tag} was not banned. Reason: unknown.`)
					)});
				} else {
					message.channel.send(new RichEmbed()
                        .setColor('ORANGE')
                        .setTitle(`${member.user.tag} was not banned. Reason: Member cannot be banned by bot.`)
                    )
				}
			});
		} else {
			return message.channel.send(new RichEmbed()
                .setColor('RED')
                .setTitle(`Please mention users to ban.`)
            );
		}
	},
  description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone1, @someone2, @someone3`,
	name: 'ban',
	perms: BAN_MEMBERS,
}
