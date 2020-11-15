import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('guildBanRemove', async (guild, user) => {
		const g = await Guild.findOne({ id: guild.id });
		const channel = await fetchTextChannel(guild, g.logChannel);

		if (channel && g.eventLogged('guildBanRemove'))
			channel.send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.displayAvatarURL(),
					},
					color: client.colors.success,
					description: 'User unbanned from guild.',
					footer: {
						text: `id: ${user.id}`,
					},
				},
			});
	});
};
