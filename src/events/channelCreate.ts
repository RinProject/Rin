import { TextChannel } from 'discord.js';
import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('channelCreate', async (channel: TextChannel) => {
		if (!channel.guild) return;
		const g = await Guild.findOne({ id: channel.guild.id });
		const logChannel = await fetchTextChannel(channel.guild, g.logChannel);

		if (logChannel && g.eventLogged('channelCreate'))
			logChannel.send({
				embed: {
					color: client.colors.success,
					title: 'New channel created',
					fields: [
						{
							name: 'Name',
							inline: true,
							value: channel.name,
						},
						{
							name: 'Type',
							inline: true,
							value: channel.type,
						},
					],
					footer: {
						text: `Channel id: ${channel.id}`,
					},
				},
			});
	});
};
