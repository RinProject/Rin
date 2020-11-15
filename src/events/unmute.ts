import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('unmute', async (guild, member) => {
		const g = await Guild.findOne({ id: guild.id });
		const channel = await fetchTextChannel(guild, g.logChannel);

		if (channel && g.eventLogged('unmute'))
			channel.send({
				embed: {
					title: 'User unmuted',
					description: `${member.toString()} unmuted`,
					color: client.colors.success,
				},
			});
	});
};
