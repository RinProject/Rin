module.exports = (client) => {
	client.on('channelPinsUpdate', (c, tm) => {
		if (!c.guild) return;

		db.all(
			`SELECT channelPinsUpdate, messageLogChannel FROM logs WHERE guild = "${c.guild.id}"`,
			(e, r) => {
				c.channels.cache.get(r[0]['messageLogChannel']).send({
					embed: {
						title: 'Channel pin update',
						description: `Pins in ${c} updated`,
					},
					timestamp: tm,
				});

				if (e) client.reportError(e);
			}
		);
	});
};
