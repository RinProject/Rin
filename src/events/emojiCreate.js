module.exports = client => {
    client.on('emojiCreate', emoji => {
        db.all(`SELECT emojiCreate, serverLogChannel FROM logs WHERE guild = "${emoji.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['emojiCreate'])
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        author: {
                            name: emoji.name,
                            iconURL: emoji.url
                        },
                        color: 0x10cc10,
                        description: 'Emoji created',
                        image: {
                            url: emoji.url,
                            height: 512,
                            width: 512
                        }
                    }
                });
            if (err)
                client.reportError(err);
        });
    });
}