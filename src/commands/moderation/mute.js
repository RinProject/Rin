const { convertTime } = require('../../core');

module.exports = {
	async run(message, args, colors) {
		let time = convertTime(args[2]);
		if (isNaN(time)) time = undefined;
		let reason = args.slice(isNaN(time) ? 2 : 3).join(' ') || 'No reason provided';
		let member =
			message.mentions.members.first() ||
			(await message.guild.members.fetch(`${args[1]}`).catch(() => {
				message.channel.send('', {
					embed: {
						title: 'Incorrect command usage',
						description: 'Please provide a user to mute.',
						color: colors.error,
					},
				});
			}));
		if (member == undefined) return;

		message.client
			.mute(message.guild, member, time, reason, message.member, message.channel)
			.then(() =>
				message.channel.send({
					embed: {
						title: 'User muted',
						description: `${member.toString()} muted by ${message.author.toString()}`,
						color: colors.negative,
						footer: {
							text: time ? 'Mute ending' : 'Mute indefinite',
						},
						timestamp: time,
					},
				})
			)
			.catch((e) =>
				message.channel.send({
					embed: {
						title: 'Unable to mute user',
						description: e.message || e,
						color: colors.error,
					},
				})
			);
	},
	description: 'Mutes a given member',
	detailed:
		'Mutes given member with the option to add a reason for the mute. Mutes are checked twice a minute meaning that an automatic unmute can be up to half a minute late.',
	examples: [
		(prefix) => `${prefix}mute @Jihyo#2423 1d Being lazy`, 
		(prefix) => `${prefix}mute 157101769858613248 1h`, 
		(prefix) => `${prefix}mute @Tarren#9722 Too tardy`
	]
	name: 'Mute',
	permissions: ['MANAGE_ROLES'],
	botPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
	guildOnly: true,
};
