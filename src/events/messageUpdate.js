module.exports = client => {
    client.on('messageUpdate', (oldMessage, newMessage) => {
        if (!newMessage.guild) return;
        db.all(`SELECT messageUpdate, messageLogChannel FROM logs WHERE guild = "${newMessage.channel.guild.id}"`, (err, rows) => {
            if (rows && rows[0] && rows[0]['messageUpdate'] && (oldMessage.content || newMessage.content))
                client.channels.cache.get(rows[0]['messageLogChannel']).send({
                    embed: {
                        author: {
                            name: newMessage.author.tag,
                            iconURL: newMessage.author.avatarURL()
                        },
                        color: 0xcc1020,
                        title: 'Message edited',
                        description: `Channel: ${newMessage.channel.toString()}\n[Message](${newMessage.url})`,
                        fields: [
                            {
                                name: 'Pre edit message',
                                inline: true,
                                value: oldMessage.content
                            },
                            {
                                name: 'Edited message',
                                inline: true,
                                value: newMessage.content
                            }
                        ],
                        footer: {
                            text: `uid: ${newMessage.author.id}`
                        }
                    }
                });
            if (err)
                client.reportError(err);
        });
    });    
}