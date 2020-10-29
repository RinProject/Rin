const { asyncDB } = require('../handler/utils');

module.exports = (client) => {
	client.on('mute', async (guild, member, time, reason, moderator) => {
		let logChan = await asyncDB.get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [
			guild.id,
		]);

		if (logChan && logChan.modLogChannel) guild.channels.resolve(logChan.modLogChannel);
		guild.channels.reoslve(logChan.modLogChannel).send({
			embed: {
				title: 'User muted',
				description: `${member.toString()} muted by ${moderator.toString()}\n\nReason:\n${reason}`,
				color: 0xff4040,
				footer: {
					text: time ? 'Mute ending' : 'Mute indefinite',
				},
				timestamp: time,
			},
		});
	});
};
