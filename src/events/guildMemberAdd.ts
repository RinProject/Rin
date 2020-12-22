import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('guildMemberAdd', async (member) => {
		const g = await Guild.findOne({ id: member.guild.id });
		const channel = await fetchTextChannel(member.guild, g.logChannel);

		if (channel && g.eventLogged('join'))
			channel.send({
				embed: {
					author: {
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL(),
					},
					color: client.colors.success,
					description: 'User joined the guild.',
					footer: {
						text: `id: ${member.id}`,
					},
				},
			});
	});
};
