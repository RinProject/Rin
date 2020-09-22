module.exports = client => {
    client.on('guildMemberRemove', (member) => {
        db.all(`SELECT guildMemberRemove, modLogChannel FROM logs WHERE guild = "${member.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildMemberRemove']) {
                client.channels.cache.get(rows[0]['modLogChannel']).send({
                    embed: {
                        author: {
                            name: member.user.tag,
                            iconURL: member.user.displayAvatarURL()
                        },
                        color: 0xcc1020,
                        description: 'User left the guild.',
                        footer: {
                            text: `id: ${member.id}`
                        }
                    }
                });
            }
            if (err)
                client.reportError(err);
        });
    });    
}