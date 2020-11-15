import { TextChannel } from 'discord.js';
import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

const channelPropertiesToCheck = [
	['name', 'Name'],
	['parent', 'Category'],
	['parentID', 'CategoryID'],
	['permissionsLocked', 'Match category permissions'],
];

export = (client: Client): void => {
	client.on('channelUpdate', async (oldChannel: TextChannel, newChannel: TextChannel) => {
		if (!newChannel.guild) return;
		const g = await Guild.findOne({ id: oldChannel.guild.id });
		const channel = await fetchTextChannel(oldChannel.guild, g.logChannel);

		if (channel && g.eventLogged('channelUpdate')) {
			const embed = {
				author: {
					name: newChannel.name,
					iconURL: newChannel.guild.iconURL(),
				},
				color: client.colors.base,
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

			if (embed.fields[0])
				channel.send({
					embed: embed,
				});
		}
	});
};
