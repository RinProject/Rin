import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('guildBanAdd', async (guild, user) => {
		const g = await Guild.findOne({ id: guild.id });
		const channel = await fetchTextChannel(guild, g.logChannel);

		if (channel && g.eventLogged('ban'))
			channel.send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.displayAvatarURL(),
					},
					color: client.colors.negative,
					description: 'User banned from guild.',
					footer: {
						text: `id: ${user.id}`,
					},
				},
			});
	});
};
