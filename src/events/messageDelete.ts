import { TextChannel } from 'discord.js';
import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('messageDelete', async (message) => {
		if (!message.guild) return;

		const g = await Guild.findOne({ id: message.guild.id });
		const channel = await fetchTextChannel(message.guild, g.logChannel);

		if (channel && g.eventLogged('messageDelete'))
			channel.send({
				embed: {
					author: {
						name: message.author.tag,
						iconURL: message.author.avatarURL(),
					},
					color: client.colors.negative,
					title: `Message deleted in ${(message.channel as TextChannel).name}`,
					description: `${message.channel.toString()}\n${message.content}`,
					footer: {
						text: `uid: ${message.author.id}`,
					},
				},
			});
	});
};
