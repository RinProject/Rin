module.exports = client => {
    client.on('webhookUpdate', (channel) => {
        db.all(`SELECT webhookUpdate, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['webhookUpdate']) {
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        author: {
                            name: channel.name,
                            iconURL: channel.guild.iconURL()
                        },
                        color: 0x1080cc,
                        title: 'Channel updated',
                        description: `Webhook changes have occurred in ${channel.toString()}`,
                        footer: {
                            text: `Channel id: ${channel.id}`
                        }
                    }
                });
            }
            if (err)
                client.reportError(err);
        });
    });
}