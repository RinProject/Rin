module.exports = {
	async run(message, args, colors) {
		let failed = 0;
		if (args[1] == undefined) {
			return message.channel.send({
				embed: {
					title: 'Please provide users to ban.',
					color: colors.error,
				},
			});
		}
		for (var i = 1; i < args.length; i++) {
			let user = await message.client.users.fetch(args[i]).catch(() => {});
			if (user) {
				await message.guild.members.ban(user, { days: 0 }).catch(() => {
					message.channel.send({
						embed: {
							title: `I am unable to ban ${user.tag}(${user.id}).`,
							color: colors.error,
						},
					});
					failed++;
				});
			} else {
				message.channel.send({
					embed: {
						title: `${args[i]} is not a valid user.`,
						color: colors.error,
					},
				});
				failed++;
			}
		}
		return message.channel.send({
			embed: {
				description: `${args.length - 1 - failed} user(s) banned`,
				color: colors.negative,
			},
		});
	},
	description: 'Bans all given users (by id)',
	detailed: 'Bans all given users (by id)',
	examples: (prefix) => `${prefix}massban <id> <id> <id>`,
	name: 'massban',
	aliases: ['mban'],
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true,
};
