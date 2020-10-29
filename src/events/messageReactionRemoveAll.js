module.exports = (client) => {
	client.on('messageReactionRemoveAll', (message) => {
		if (!message.guild) return;
		db.all(
			`SELECT messageReactionRemoveAll, messageLogChannel FROM logs WHERE guild = "${message.channel.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['messageReactionRemoveAll'])
					client.channels.cache.get(rows[0]['messageLogChannel']).send({
						embed: {
							author: {
								name: message.author.tag,
								iconURL: message.author.avatarURL(),
							},
							color: 0xcc1020,
							title: `All reactions removed from: `,
							description: `${message.content}\n[Message](${message.url})`,
							footer: {
								text: `uid: ${message.author.id}`,
							},
						},
					});
				if (err) client.reportError(err);
			}
		);
	});
};
