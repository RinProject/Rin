const { asyncDB } = require('../handler/utils');

module.exports = (client) => {
	client.on('unmute', async (guild, member) => {
		let logChan = await asyncDB.get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [
			guild.id,
		]);

		if (logChan && logChan.modLogChannel)
			guild.channels.resolve(logChan.modLogChannel).send({
				embed: {
					title: 'User unmuted',
					description: `${member.toString()} unmuted`,
					color: 0x80ff80,
				},
			});
	});
};
