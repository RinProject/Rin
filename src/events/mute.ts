import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('mute', async (guild, member, time, reason, moderator) => {
		const g = await Guild.findOne({ id: guild.id });
		const channel = await fetchTextChannel(guild, g.logChannel);

		if (channel && g.eventLogged('mute'))
			channel.send({
				embed: {
					title: 'User muted',
					description: `${member.toString()} muted by ${moderator.toString()}\n\nReason:\n${reason}`,
					color: client.colors.negative,
					footer: {
						text: time ? 'Mute ending' : 'Mute indefinite',
					},
					timestamp: time,
				},
			});
	});
};
