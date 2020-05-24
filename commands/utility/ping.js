module.exports = {
	async run(message, args) {
    message.channel.send('', {
		embed: {
                title: `Calculating ping..`,
		color: 0xFF80CC
		}
		}
		).then(
            msg => {
                msg.edit('', {
                embed: {
                    title: `Ping`,
                    description: `The bot latency is ${(msg.createdTimestamp - message.createdTimestamp)}ms`,
                    color: 0xFF80CC
                }})
                }
        )
	},
	description: 'Provides ping',
	detailed: 'Provides latency for the bot',
	examples: prefix => `${prefix}ping`,
	name: 'ping',
	perms: [null]
}
