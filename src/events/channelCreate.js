module.exports = client => {
    client.on('channelCreate', channel => {
        if (!channel.guild) return;
        db.all(`SELECT channelCreate, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['channelCreate'])
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        color: 0x10cc10,
                        title: 'New channel created',
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