module.exports = {
	async run(message, args) {
		if(args[1] == undefined || args[2] == undefined) {
			return message.channel.send('', {
				embed: {
					title: 'Invalid number of inputs',
					description: 'Please enter a role, followed by a colour.\nExamples: `members #FF8000`, `@coolKids #FF80CC`',
					color: 0xFF0000
				}
			});
		} else if(!args[2].match(/#?[0-9a-f]{6}/gi))
			return message.channel.send('', {
				embed: {
					title: 'Invalid colour',
					description: 'Please enter a colour in hex format.\nExample: #FF8000.',
					color: 0xFF0000
				}
			});
		else {
			let role = message.mentions.roles.first() || message.guild.roles.cache.find(role => role.name === args[1]);
			if(role == undefined)
				return message.channel.send('', {
					embed: {
						title: "Could not find role.",
						description: 'Please provide a valid role, either by @mention or by name.\nNote: names may not contain whitespace, in such cases us @mention',
						color: 0xFF0000
					}
				});
			let color = args[2].startsWith('#') ? args[2] : '#' + args[2];
			let oldColor = role.hexColor;
			role.edit({
				color: color
			});
			return message.channel.send('', {
				embed: {
					title: `Role ${role.name} colour updated`,
					description: `Colour changed from ${oldColor} to ${color}`,
					color: color
				}
			});
		}
	},
	description: 'Changes a Roles Color',
	detailed: 'Changes the color of a preexisting role',
	examples: prefix => `${prefix}rolecolour @rolename #hexcolor`,
	name: 'rolecolour',
	aliases: ['rolecolor'],
	perms: ['MANAGE_ROLES'],
	botPerms: ['MANAGE_ROLES']
}
