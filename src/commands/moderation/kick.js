module.exports = {
	async run(message, args, colors) {
		let member =
			message.mentions.members.first() || (await message.guild.members.cache.get(args[1]));
		let reason = args.slice(2).join(' ');
		if (!reason) reason = `No reason provided. Responsible moderator: ${message.author.tag}`;

		if (member == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'An error occurred',
					description: 'No member was provided to kick.',
					color: colors.error,
				},
			});
		}

		if (!member.kickable) {
			return message.channel.send('', {
				embed: {
					title: 'An error occurred.',
					description:
						"The bot is unable to kick the given member, please check it's position in the hierarchy.",
					color: colors.error,
				},
			});
		} else {
			member.kick(reason).then(() => {
				message.channel.send('', {
					embed: {
						title: 'Member successfully kicked',
						description: `${member.user.tag} has been kicked by ${message.author.tag}.`,
						color: colors.negative,
						footer: {
							text: `id: ${member.id}`,
						},
					},
				});
			});
		}
	},
	description: 'Kicks a givem member.',
	detailed: 'Kicks given member with the option to add a reason for the kick.',
	examples: [
		(prefix) => `${prefix}kick @someone reason`,
		(prefix) => `${prefix}kick <id> reason`
	],
	name: 'Kick',
	permissions: ['KICK_MEMBERS'],
	botPermissions: ['KICK_MEMBERS'],
	guildOnly: true,
};
