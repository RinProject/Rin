module.exports = client => {
    client.on('guildIntegrationsUpdate', guild => {
        db.all(`SELECT guildIntegrationsUpdate, serverLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildIntegrationsUpdate']) {
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        author: {
                            name: guild.name,
                            iconURL: guild.iconURL()
                        },
                        color: 0x1080cc,
                        description: 'Guild integrations updated.',
                        footer: {
                            text: `Guild id: ${guild.id}`
                        }
                    }
                });
            }
            if (err)
                client.reportError(err);
        });
    });
    
}