const memberProperties = [
	'displayHexColor',
	'displayName',
	'nickname'
]

module.exports = client => {
    client.on('guildMemberUpdate', (oldMember, newMember) => {
        db.all(`SELECT guildMemberUpdate, modLogChannel FROM logs WHERE guild = "${newMember.guild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildMemberUpdate']) {
                let embed = {
                    author: {
                        name: newMember.user.tag,
                        iconURL: newMember.user.displayAvatarURL()
                    },
                    color: 0x1080cc,
                    title: 'Guild member updated',
                    description: newMember.toString(),
                    fields: [],
                    footer: {
                        text: `id: ${newMember.id}`
                    }
                }
                memberProperties.forEach(property => {
                    if (oldMember[property] != newMember[property])
                        embed.fields.push({
                            name: property,
                            inline: true,
                            value: `Changed from ${oldMember[property]} to ${newMember[property]}`
                        });
                });
                let change = oldMember.roles.cache.array().length - newMember.roles.cache.array().length,
                    editRole;
                if (change > 0) {
                    oldMember.roles.cache.each(role => {
                        if (!newMember.roles.cache.get(role.id))
                            editRole = role;
                    });
                } else if (change < 0) {
                    newMember.roles.cache.each(role => {
                        if (!oldMember.roles.cache.get(role.id))
                            editRole = role;
                    });
                }
                if (editRole)
                    embed.fields.push({
                        name: change < 0 ? 'Role added' : 'Role removed',
                        inline: true,
                        value: editRole.toString()
                    });
    
                // TODO perms
    
                if (embed.fields[0])
                    client.channels.cache.get(rows[0]['modLogChannel']).send({
                        embed: embed
                    });
            }
            if (err)
                client.reportError(err);
        });
    });
}