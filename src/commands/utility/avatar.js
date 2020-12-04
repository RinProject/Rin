module.exports = {
	async run(message, args, colors) {
		let member =
			message.mentions.members.first() ||
			(await message.guild.members.cache.get(args[1])) ||
			message.member;
		message.channel.send('', {
			embed: {
				title: `${member.user.username}'s Avatar`,
				description: `[Avatar URL](${member.user.displayAvatarURL({
					format: 'png',
					size: 512,
					dynamic: true,
				})})`,
				color: colors.base,
				image: {
					url: member.user.displayAvatarURL({
						format: 'png',
						size: 512,
						dynamic: true,
					}),
					height: 512,
					width: 512,
				},
			},
		});
	},
	aliases: ['Avi', 'Pfp'],
	description: 'Displays a users avatar',
	detailed: 'Displays a users avatar.',
	examples: [
		(prefix) => `${prefix}avatar`, 
		(prefix) => `${prefix}avatar @Soze#0040`,
		(prefix) => `${prefix}avatar 169631518896029698`
	],
	name: 'Avatar',
};
