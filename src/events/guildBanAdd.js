module.exports = client => {
    client.on('guildBanAdd', (guild, user) => {
        db.all(`SELECT guildBanAdd, modLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildBanAdd']) {
                client.channels.cache.get(rows[0]['modLogChannel']).send({
                    embed: {
                        author: {
                            name: user.tag,
                            iconURL: user.displayAvatarURL()
                        },
                        color: 0xcc1020,
                        description: 'User banned from guild.',
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