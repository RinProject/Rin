module.exports = {
	async run(message) {
		if (message.mentions.members.first()){
			message.mentions.members.tap(member => {
				let membersRole = message.guild.roles.find('name', 'Cutie');//Need to replace test with an actual role that should have immunity(mods/admins)
				if(!message.mentions.roles.has(membersRole.id)) {
					member.ban(0).then(() => {
						/*message.channel.send(new RichEmbed()
							.setColor('GREEN')
							.setTitle(`${member.user.tag} has been banned by ${message.author.tag}.`)
                            .setImage(message.mentions.avatarURL)
						);*/
								message.channel.send('', {embed: {
										title:`${member.user.tag} has been banned by ${message.author.tag}.`,
										color: 0x00FF00
							  }});
						}
					}).catch(() => {
						/*message.channel.send(new RichEmbed()
							.setColor('RED')
							.setTitle(`${member.user.tag} was not banned. Reason: unknown.`)
					)});*/
								message.channel.send('', {embed: {
										title:`${member.user.tag} was not banned. Reason: unknown.`,
										color: 0xFF0000
								}});
				} else {
					/*message.channel.send(new RichEmbed()
                        .setColor('ORANGE')
                        .setTitle(`${member.user.tag} was not banned. Reason: Member cannot be banned by bot.`)
                    )*/
										message.channel.send('', {embed: {
												title:`${member.user.tag} was not banned. Reason: Member cannot be banned by bot.`,
												color: 0xFF0000
										}});
				}
			});
		} else {
			/*
			return message.channel.send(new RichEmbed()
                .setColor('RED')
                .setTitle(`Please mention users to ban.`)
            );*/
						message.channel.send('', {embed: {
								title:`Please mention users to ban.`,
								color: 0xFF0000
						}});
		}
	},
  description: 'Bans a user',
	detailed: 'Bans all users mentioned',
	examples: prefix => `${prefix}ban @someone1, @someone2, @someone3`,
	name: 'ban',
	perms: [`BAN_MEMBERS`]
}
