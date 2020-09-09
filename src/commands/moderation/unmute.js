const { unmute } = require('../../handler/index').mute;

module.exports = {
	async run(message, args, colors) {
		let member = message.mentions.members.first() || await message.guild.members.fetch(`${args[1]}`)
		.catch(e => {
			message.channel.send('', {
				embed: {
					title: 'Incorrect command usage',
					description: 'Please provide a user to unmute.',
					color: colors.error
				}
			});
		});
		if (member == undefined) return; 
		
		unmute(message.guild, member)
		.then(()=>{
			message.channel.send({embed:{
				title: 'User unmuted',
				description: `${member.toString()} unmuted by ${message.author.toString()}`,
				color: colors.success
			}})
		}).catch(e=>
			message.channel.send({embed:{
				title: 'Unable to unmute user',
				description: e.message||e,
				color: colors.error
			}})
		);
	},
	description: 'Unmutes a given member',
	detailed: 'Unmutes given member with the option to add a reason for the unmute.',
	examples: prefix => `${prefix}unmute @Jihyo#2423, ${prefix}unmute 157101769858613248`,
	name: 'unmute',
	permissions: ['MANAGE_ROLES'],
	botPermissions: ['MANAGE_ROLES'],
	guildOnly: true
}
