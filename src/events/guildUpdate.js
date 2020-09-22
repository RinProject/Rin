const guildProperties = [
	'afkChannel',
	'afkChannelID',
	'afkTimeout',
	'applicationID',
	'defaultMessageNotifications',
	'description',
	'embedChannel',
	'embedChannelID',
	'embedEnabled',
	'explicitContentFilter',
	'mfaLevel',
	'name',
	'nameAcronym',
	'owner',
	'ownerID',
	'partnered',
	'premiumSubscriptionCount',
	'premiumTier',
	'publicUpdatesChannel',
	'publicUpdatesChannelID',
	'region',
	'rulesChannel',
	'rulesChannelID',
	'systemChannel',
	'systemChannelID',
	'vanityURLCode',
	'verificationLevel',
	'verified',
	'widgetChannel',
	'widgetChannelID',
	'widgetEnabled'
];

module.exports = client => {
    client.on('guildUpdate', (oldGuild, newGuild) => {
        db.all(`SELECT guildUpdate, serverLogChannel FROM logs WHERE guild = "${newGuild.id}"`, (err, rows) => {
            if (rows[0] && rows[0]['guildUpdate']) {
                let embed = {
                    author: {
                        name: newGuild.name,
                        iconURL: newGuild.iconURL()
                    },
                    color: 0x1080cc,
                    title: 'Guild updated',
                    fields: [],
                    footer: {
                        text: `Guild id: ${newGuild.id}`
                    }
                }
                guildProperties.forEach(property => {
                    if (oldGuild[property] != newGuild[property])
                        embed.fields.push({
                            name: property,
                            inline: true,
                            value: `Changed from ${oldGuild[property]} to ${newGuild[property]}`
                        });
                });
                // TODO feature change
                if (embed.fields[0])
                    client.channels.cache.get(rows[0]['serverLogChannel']).send({
                        embed: embed
                    });
            }
            if (err)
                client.reportError(err);
        });
    });  
}