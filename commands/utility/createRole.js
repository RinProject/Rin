module.exports = {
	async run(message, args) {
		if(args[1] == undefined) {
			return message.channel.send('', {
				embed: {
					title: `Please follow the format: ${prefix}createrole @rolename #hexcolor`,
					color: 0xFF0000
				}
			});
		} else if(args[2] == undefined) {
			return message.channel.send('', {
				embed: {
					title: `Please follow the format: ${prefix}createrole @rolename #hexcolor`,
					color: 0xFF0000
				}
			});
		} else {
			let role = await message.member.guild.roles.create({
				data: {
					name: args[1],
					color: parseInt(args[2].replace('#', ''), 16) || 0x0000ff
				},
				reason: `Creation requested by: ${message.author.tag}, id: ${message.author.id}`
			});
			return message.channel.send('', {
				embed: {
					title: 'New role created',
					description: role.toString(),
					color: args[2]
				}
			});
		}
	},
	description: 'Creates a role',
	detailed: 'Creates a role: Takes in name and color',
	examples: prefix => `${prefix}createrole @rolename #hexcolor`,
	name: 'createrole',
	perms: ['MANAGE_ROLES'],
	botPerms: ['MANAGE_ROLES']
}
