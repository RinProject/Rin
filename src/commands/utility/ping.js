module.exports = {
	async run(message, colors) {
		message.channel.send('', {
			embed: {
				title: 'Calculating ping..',
				color: colors.base
			}
		}).then(msg => {
			msg.edit('', {
				embed: {
					title: 'Ping',
					description: `:hourglass: ${(msg.createdTimestamp - message.createdTimestamp)}ms\n\n :heartbeat: ${message.client.ws.ping}ms`,
					color: colors.base
				}
			});
		});
	},
	description: 'Provides ping',
	detailed: 'Provides API latency and WebSocket ping for the bot.',
	examples: prefix => `${prefix}ping`,
	name: 'ping'
}
