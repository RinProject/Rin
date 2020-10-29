module.exports = (client) => {
	client.on('guildMemberAdd', (member) => {
		db.all(
			`SELECT guildMemberAdd, modLogChannel FROM logs WHERE guild = "${member.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['guildMemberAdd']) {
					client.channels.cache.get(rows[0]['modLogChannel']).send({
						embed: {
							author: {
								name: member.user.tag,
								iconURL: member.user.displayAvatarURL(),
							},
							color: 0x10cc10,
							description: 'User joined the guild.',
							footer: {
								text: `id: ${member.id}`,
							},
						},
					});
				}
				if (err) client.reportError(err);
			}
		);
	});
};
