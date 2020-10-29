module.exports = (client) => {
	client.on('emojiUpdate', (oldEmoji, newEmoji) => {
		db.all(
			`SELECT emojiUpdate, serverLogChannel FROM logs WHERE guild = "${newEmoji.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['emojiUpdate']) {
					client.channels.cache.get(rows[0]['serverLogChannel']).send({
						embed: {
							author: {
								name: newEmoji.name,
								iconURL: newEmoji.url,
							},
							color: 0x1080cc,
							title: 'Emoji changed',
							fields: [
								{
									name: 'Old name',
									inline: true,
									value: oldEmoji.name,
								},
								{
									name: 'New name',
									inline: true,
									value: newEmoji.name,
								},
							],
						},
					});
				}
				if (err) client.reportError(err);
			}
		);
	});
};
