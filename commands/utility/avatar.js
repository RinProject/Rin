module.exports = {
	async run(message, args) {
		let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1]) || message.member;
		message.channel.send('', {
			embed: {
				title: `${member.user.username}'s Avatar`,
				color: 0xFF80CC,
				image: {
					url: member.user.avatarURL(),
					height: 512, 
					width: 512
				}
			}
		})
	},
	description: 'Provides a users avatar',
	detailed: 'Provides a users avatar',
	examples: prefix => `${prefix}avatar @user, ${prefix}avatar <user id>`,
	name: 'avatar',
	perms: [null]
}
