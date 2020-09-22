module.exports = client => {
    client.on('emojiDelete', emoji => {
        db.all(`SELECT emojiDelete, serverLogChannel FROM logs WHERE guild = "${emoji.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['emojiDelete'])
                client.channels.cache.get(rows[0]['serverLogChannel']).send({
                    embed: {
                        author: {
                            name: emoji.name,
                            iconURL: emoji.url
                        },
                        color: 0xcc1020,
                        description: 'Emoji deleted',
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