module.exports = client => {
    client.on('channelDelete', channel => {
        if (!channel.guild) return;
        db.all(`SELECT channelDelete, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['channelDelete'])
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        color: 0xcc1020,
                        title: 'Channel deleted',
                        fields: [
                            {
                                name: 'Name',
                                inline: true,
                                value: channel.name
                            },
                            {
                                name: 'Type',
                                inline: true,
                                value: channel.type
                            }
                        ],
                        footer: {
                            text: `Channel id: ${channel.id}`
                        }
                    }
                });
            if (err)
                client.reportError(err);
        });
    });    
}