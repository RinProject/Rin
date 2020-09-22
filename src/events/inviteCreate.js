module.exports = client => {
    client.on('inviteCreate', invite => {
        db.all(`SELECT inviteCreate, messageLogChannel FROM logs WHERE guild = "${invite.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['inviteCreate'])
                client.channels.cache.get(rows[0]['messageLogChannel']).send({
                    embed: {
                        author: {
                            name: invite.inviter.tag,
                            iconURL: invite.inviter.avatarURL()
                        },
                        color: 0x10cc10,
                        title: 'Invite created',
                        fields: [
                            {
                                name: 'Invite code',
                                inline: true,
                                value: invite.code
                            },
                            {
                                name: 'Lifetime',
                                inline: true,
                                value: `${invite.maxAge / 3600}hours`
                            },
                            {
                                name: 'Max uses',
                                inline: true,
                                value: invite.maxUses
                            }
                        ],
                        footer: {
                            text: `uid: ${invite.inviter.id}`
                        }
                    }
                });
            if (err)
                client.reportError(err);
        });
    });  
}