module.exports = client => {
    client.on('messageReactionRemoveEmoji', (messageReaction) => {
        if (!messageReaction.message.guild) return;
        db.all(`SELECT messageReactionRemoveEmoji, messageLogChannel FROM logs WHERE guild = "${messageReaction.message.channel.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['messageReactionRemoveEmoji'])
                client.channels.cache.get(rows[0]['messageLogChannel']).send({
                    embed: {
                        author: {
                            name: message.user.tag,
                            iconURL: messageReaction.message.user.avatarURL()
                        },
                        color: 0xcc1020,
                        title: `Reaction removed`,
                        description: `Removed reaction ${messageReaction.emoji.toString()}\n[Message](${messageReaction.message.url})`,
                        footer: {
                            text: `Message id: ${messageReaction.message.id}`
                        }
                    }
                });
            if (err)
                client.reportError(err);
        });
    });       
}