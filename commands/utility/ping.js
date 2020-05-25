module.exports = {
	async run(message) {
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
                    description: `The API latency is ${(msg.createdTimestamp - message.createdTimestamp)}ms\n The heartbeat latency is ${message.client.ws.ping}ms`,
                    color: 0xFF80CC
                }})
                }
        )
	},
	description: 'Provides ping',
	detailed: 'Provides API latency and WebSocket ping for the bot.',
	examples: prefix => `${prefix}ping`,
	name: 'ping',
	perms: [null]
}
