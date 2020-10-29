module.exports = (client) => {
	client.on('inviteDelete', (invite) => {
		db.all(
			`SELECT inviteDelete, messageLogChannel FROM logs WHERE guild = "${invite.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['inviteDelete'])
					client.channels.cache.get(rows[0]['messageLogChannel']).send({
						embed: {
							author: {
								name: invite.inviter.tag,
								iconURL: invite.inviter.avatarURL(),
							},
							color: 0xcc1020,
							title: 'Invite deleted',
							fields: [
								{
									name: 'Invite code',
									inline: true,
									value: invite.code,
								},
								{
									name: 'Uses',
									inline: true,
									value: invite.uses,
								},
							],
							footer: {
								text: `uid: ${invite.inviter.id}`,
							},
						},
					});
				if (err) client.reportError(err);
			}
		);
	});
};
