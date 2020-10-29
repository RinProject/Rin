module.exports = (client) => {
	client.on('messageReactionRemove', (reaction, user) => {
		if (reaction.partial)
			try {
				reaction.fetch();
			} catch (e) {
				console.error(e);
				return;
			}
		if (!reaction.message.guild) return;
		db.all(
			`SELECT roleID FROM reactRoles WHERE messageID = (?) AND emojiID = (?);`,
			[reaction.message.id, reaction.emoji.id],
			(err, rows) => {
				if (err) console.error(err);
				if (rows && rows[0] && rows[0].roleID)
					reaction.message.guild.members.cache
						.get(user.id)
						.roles.remove(rows[0].roleID, 'Reaction role')
						.catch(() => {});
			}
		);
		db.all(
			`SELECT messageReactionRemove, messageLogChannel FROM logs WHERE guild = "${reaction.message.channel.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['messageReactionRemove'])
					client.channels.cache.get(rows[0]['messageLogChannel']).send({
						embed: {
							author: {
								name: user.tag,
								iconURL: user.avatarURL(),
							},
							color: 0xcc1020,
							title: `Reaction removed`,
							description: `${user.tag} removed reaction ${reaction.emoji.toString()}\n[Message](${
								reaction.message.url
							})`,
							footer: {
								text: `uid: ${user.id}`,
							},
						},
					});
				if (err) client.reportError(err);
			}
		);
	});
};
