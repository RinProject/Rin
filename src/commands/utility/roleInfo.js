const options = require('../../../JSONstorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);

module.exports = {
	async run(message, args, colors) {
		let role =
			message.mentions.roles.first() ||
			message.guild.roles.cache.find((role) => role.name === args[1]) ||
			message.guild.roles.cache.find((role) => role.id === args[1]);
		if (role == undefined) {
			return message.channel.send('', {
				embed: {
					title: `Please provide a valid role.`,
					color: colors.error,
				},
			});
		} else {
			message.channel.send('', {
				embed: {
					title: `Role Information`,
					description: `Name: ${role.name}\nColor: ${role.hexColor}\nMembers in role: ${
						role.members.size
					}\nCreation Date: ${formatter.format(role.createdAt)}`,
					footer: {
						text: `Role ID: ${role.id}`,
					},
					color: role.color,
				},
			});
		}
	},
	description: `Gets a given role's info`,
	detailed: `Gets a given role's info`,
	examples: (prefix) =>
		`${prefix}roleinfo @role, ${prefix}roleinfo <role id>, ${prefix}roleinfo <role name>`,
	name: 'roleinfo',
	guildOnly: true,
};
