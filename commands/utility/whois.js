module.exports = {
	async run(message, args) {
		if (args[1] == undefined) {
			return message.channel.send('', {
				embed: {
					author: {
						name: message.author.tag,
						iconURL: message.author.avatarURL()
					},
					thumbnail: {
						url: message.author.avatarURL()
					},
					description: message.author.toString(),
					fields: [
						{
							name: 'Joined At',
							inline: true,
							value: message.member.joinedTimestamp
						}
					]
				}
			})
		}
	},
	description: 'Returns info of a user',
	detailed: 'Returns info of a user',
	examples: prefix => `${prefix}whois @someone`,
	name: 'whois',
	perms: null,
}