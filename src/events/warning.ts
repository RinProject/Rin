import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('warning', async (guild, member, time, reason, moderator) => {
		const g = await Guild.findOne({ id: guild.id });
		const channel = await fetchTextChannel(guild, g.logChannel);

		if (channel && g.eventLogged('warning'))
			channel.send({
				embed: {
					title: 'User warned',
					description: `${member.toString()} muted by ${moderator.toString()}\n\nReason:\n${reason}`,
					color: client.colors.negative,
					footer: {
						text: 'Warned:',
					},
					timestamp: time,
				},
			});
	});
};
