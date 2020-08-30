const { mute, startMuteCheck } = require('../../utils').mute;
const { convertTime } = require('../../utils');

startMuteCheck();

module.exports = {
	async run(message, args) {
		let time = convertTime(args[2]);
		if(isNaN(time))
			time = undefined;
		let reason = args.slice(isNaN(time)?2:3).join(' ')||'No reason provided';
		let member = message.mentions.members.first() || await message.guild.members.fetch(`${args[1]}`)
		.catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Incorrect command usage',
					description: 'Please provide a user to mute.',
					color: colors.error
				}
			});
		});
		if (member == undefined) return;

		mute(message.guild, member, time, reason, message.author, message.channel)
		.then(()=>
			message.channel.send({embed:{
				title: 'User muted',
				description: `${member.toString()} muted by ${message.author.toString()}`,
				color: colors.negative,
				footer: {
					text: time?'Mute ending':'Mute indefinite'
				},
				timestamp: time
			}})
		)
		.catch(e=>
			message.channel.send({embed:{
				title: 'Unable to mute user',
				description: e.message||e,
				color: colors.error
			}})
		);
},
	description: 'Mutes a given member',
	detailed: 'Mutes given member with the option to add a reason for the mute. Mutes are checked twice a minute meaning that an automatic unmute can be up to half a minute late.',
	examples: prefix => `${prefix}mute @Jihyo#2423 1d Being lazy, ${prefix}mute 157101769858613248 1h, ${prefix}mute @Tarren#9722 Too tardy`,
	name: 'mute',
	perms: ['MANAGE_ROLES'],
	botPerms: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
	guildOnly: true
}
