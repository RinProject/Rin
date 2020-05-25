const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');

module.exports = {
	async run(message, args) {
		message.channel.send({
			embed: {
				title: `Info for ${message.guild.name}`,
				color: 0xFF80CC,
				author: {
					name: message.guild.name,
					iconURL: message.guild.iconURL()
				},
				fields: [
					{
						name: 'Owner',
						inline: true,
						value: `${message.guild.owner.toString()}`
					},
					{
						name: 'Region',
						value: `${(await message.guild.fetchVoiceRegions()).findKey(region => region.optimal)}`,
						inline: true
					}
				]
			}
		});
	},
	aliases: ['info'],
	description: 'Returns info about the server',
	detailed: 'Returns info about the server',
	examples: prefix => `${prefix}serverinfo`,
	name: 'serverinfo',
	perms: null
}