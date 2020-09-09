const config = require('../../../config.json')

module.exports = {
	async run(message, args, colors) {
		if(args[1] == undefined) {
			return message.channel.send('', {
				embed: {
					title: `Please follow the format: ${config.prefix}createrole @rolename #hexcolor`,
					color: colors.error
				}
			});
		} else if(args[2] == undefined) {
			return message.channel.send('', {
				embed: {
					title: `Please follow the format: ${config.prefix}createrole @rolename #hexcolor`,
					color: colors.error
				}
			});
		} else {
			let role = await message.member.guild.roles.create({
				data: {
					name: args[1],
					color: parseInt(args[2].replace('#', ''), 16) || colors.base
				},
				reason: `Creation requested by: ${message.author.tag}, id: ${message.author.id}`
			});
			return message.channel.send('', {
				embed: {
					title: 'New role created',
					description: role.toString(),
					color: parseInt(args[2].replace('#', ''), 16) || colors.base
				}
			});
		}
	},
	description: 'Creates a role',
	detailed: 'Creates a role: Takes in name and color',
	examples: prefix => `${prefix}createrole @rolename #hexcolor`,
	name: 'createrole',
	permissions: ['MANAGE_ROLES'],
	botPermissions: ['MANAGE_ROLES'],
	guildOnly: true
}
