module.exports = {
	async run(message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]) || message.member;
		message.channel.send('', {
			embed: {
				title: `${member.user.username}'s Avatar`,
				description: `[Avatar URL](${member.user.displayAvatarURL({format: "png", size: 512, dynamic: true})})`,
				color: colors.base,
				image: {
					url: member.user.displayAvatarURL({
						format: "png",
						size: 512,
						dynamic: true
					}),
					height: 512, 
					width: 512
				}
			}
		});
	},
	aliases: ['avi', 'pfp'],
	description: 'Provides a users avatar',
	detailed: 'Provides a users avatar',
	examples: prefix => `${prefix}avatar @user, ${prefix}avatar <user id>`,
	name: 'avatar',
	perms: null
}
