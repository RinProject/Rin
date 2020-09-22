module.exports = client => {
    client.on('guildBanRemove', (guild, user) => {
        db.all(`SELECT guildBanRemove, modLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildBanRemove']) {
                client.channels.cache.get(rows[0]['modLogChannel']).send({
                    embed: {
                        author: {
                            name: user.tag,
                            iconURL: user.displayAvatarURL()
                        },
                        color: 0xcc1020,
                        description: 'User unbanned from guild.',
                        footer: {
                            text: `id: ${user.id}`
                        }
                    }
                });
            }
            if (err)
                client.reportError(err);
        });
    });
}