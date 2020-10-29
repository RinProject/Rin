module.exports = (client) => {
	client.on('messageDeleteBulk', (messages) => {
		if (!messages.first().guild) return;
		db.all(
			`SELECT messageDelete, messageLogChannel FROM logs WHERE guild = "${
				messages.first().guild.id
			}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['messageDelete']) {
					let fields = [];
					messages.each((message) => {
						let content = message.content;
						if (!content)
							content = `Message data unavailable, message likely included an attachment or embed.`;
						fields.push({
							name: `${message.author.tag} | id: ${message.author.id}`,
							inline: false,
							value: content,
						});
					});
					client.channels.cache.get(rows[0]['messageLogChannel']).send({
						embed: {
							color: 0xcc1020,
							title: 'Message bulk deletion',
							description: `${messages.size} messages were deleted in ${messages.first().channel}`,
							fields: fields,
						},
					});
				}
				if (err) client.reportError(err);
			}
		);
	});
};
