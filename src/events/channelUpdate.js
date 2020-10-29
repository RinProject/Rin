const channelPropertiesToCheck = [
	['name', 'Name'],
	['parent', 'Category'],
	['parentID', 'CategoryID'],
	['permissionsLocked', 'Match category permissions'],
];

module.exports = (client) => {
	client.on('channelUpdate', (oldChannel, newChannel) => {
		if (!newChannel.guild) return;
		db.all(
			`SELECT channelUpdate, serverLogChannel FROM logs WHERE guild = "${newChannel.guild.id}"`,
			(err, rows) => {
				if (rows[0] && rows[0]['channelUpdate']) {
					let embed = {
						author: {
							name: newChannel.name,
							iconURL: newChannel.guild.iconURL(),
						},
						color: 0x1080cc,
						title: 'Channel updated',
						description: `Channel type: ${newChannel.type}`,
						fields: [],
						footer: {
							text: `Channel id: ${newChannel.id}`,
						},
					};
					channelPropertiesToCheck.forEach((property) => {
						if (newChannel[property[0]] != oldChannel[property[0]])
							embed.fields.push({
								name: property[1],
								inline: true,
								value: `Changed from ${newChannel[property[0]]} to ${oldChannel[property[0]]}`,
							});
					});
					// TODO check permissions
					if (embed.fields[0])
						client.channels.cache.get(rows[0]['serverLogChannel']).send({
							embed: embed,
						});
				}
				if (err) client.reportError(err);
			}
		);
	});
};
