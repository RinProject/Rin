module.exports = {
	async run(message, args, colors) {
		let reason = '';
		let days = 0;
		let user =
			message.mentions.users.first() ||
			(await message.client.users.fetch(args[1]).catch(() => {
				message.channel.send('', {
					embed: {
						title: 'Please provide a user to ban.',
						color: colors.error,
					},
				});
			}));

		if (user == undefined) return;

		if (isNaN(args[2])) {
			reason = args.slice(2).join(' ');
			if (!reason) reason = `No reason provided. Responsible moderator: ${message.author.tag}`;
		} else {
			days = parseInt(args[2]);
			if (days > 7) days = 7;
			reason = args.slice(3).join(' ');
			if (!reason) reason = `No reason provided. Responsible moderator: ${message.author.tag}`;
		}

		message.guild.members
			.ban(user, { days: days, reason: reason })
			.then(() => {
				message.channel.send('', {
					embed: {
						title: 'User successfully banned',
						description: `${user.tag} has been banned by ${message.author.tag}.`,
						color: colors.negative,
						footer: {
							text: `id: ${user.id}`,
						},
					},
				});
			})
			.catch(() => {
				message.channel.send('', {
					embed: {
						title: 'Failed to ban user.',
						color: colors.error,
					},
				});
			});
	},
	description: 'Bans a user.',
	detailed:
		'Bans given user, with options to erase messages from the past given amount of days, and a reason.',
	examples: [
		(prefix) => `${prefix}ban @someone days reason`,
		(prefix) => `${prefix}ban <id> days reason`,
	],
	name: 'Ban',
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true,
};
