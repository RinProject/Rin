module.exports = client => {
    client.on("messageDelete", (m) => {
        if (!m.guild) return;

        db.all(`SELECT messageDelete, messageLogChannel FROM logs WHERE guild = "${m.channel.guild.id}"`, (e, r) => {
            if (r[0] && r[0]['messageDelete'])
                   c.channels.cache.get(r[0]['messageLogChannel']).send({
                       embed: {
                            author: {
                                name: m.author.tag,
                                iconURL: m.author.avatarURL()
                            },
                            color: 0xcc1020,
                            title: `Message deleted in ${m.channel.name}`,
                            description: `${m.channel.toString()}\n${m.content}`,
                            footer: {
                                text: `uid: ${m.author.id}`
                            }
                       }
                   });

            if (e) client.reportErr(e);
        })
    })
}