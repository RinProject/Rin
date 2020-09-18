const { convertTime } = require('../../handler/index').utils;

module.exports = {
	async run(message, args, colors) {
		let time = convertTime(`1m`);
		let reason = 'No reason provided';
		let member = message.mentions.members.first() || await message.guild.members.fetch(`${args[1]}`)
		.catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Incorrect command usage',
					description: 'Please provide a user to spank.',
					color: colors.error
				}
			});
		});
		if (member == undefined) return;

		message.client.mute(message.guild, member, time, reason, message.author, message.channel)
		.then(()=>
			message.channel.send({embed:{
				title: 'User spanked',
				description: `${member.toString()}has been spanked by ${message.author.toString()}`,
				color: colors.negative,
				timestamp: time
			}})
		)
		.catch(e=>
			message.channel.send({embed:{
				title: 'Unable to spank user',
				description: e.message||e,
				color: colors.error
			}})
		);
},
	description: 'Mutes a given member for one minute.',
	detailed: 'Mutes a given member for one minute. Mutes are checked twice a minute meaning that an automatic unmute can be up to half a minute late.',
	examples: prefix => `${prefix}spank @Jihyo#2423`,
	name: 'spank',
	permissions: ['MANAGE_ROLES'],
	botPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
	guildOnly: true
}
