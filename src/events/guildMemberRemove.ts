import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('guildMemberRemove', async (member) => {
		const g = await Guild.findOne({ id: member.guild.id });
		const channel = await fetchTextChannel(member.guild, g.logChannel);

		if (channel && g.eventLogged('leave'))
			channel.send({
				embed: {
					author: {
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL(),
					},
					color: client.colors.negative,
					description: 'User left the guild.',
					footer: {
						text: `id: ${member.id}`,
					},
				},
			});
	});
};
