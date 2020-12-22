import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('messageUpdate', async (oldMessage, newMessage) => {
		if (!newMessage.guild) return;
		const g = await Guild.findOne({ id: oldMessage.guild.id });
		const channel = await fetchTextChannel(oldMessage.guild, g.logChannel);

		if (channel && g.eventLogged('messageEdit')) {
			const fields = [
				{
					name: 'Pre edit message',
					inline: true,
					value: oldMessage.content,
				},
				{
					name: 'Edited message',
					inline: true,
					value: newMessage.content,
				},
			];
			if (fields[0].value && fields[1].value)
				channel.send({
					embed: {
						author: {
							name: newMessage.author.tag,
							iconURL: newMessage.author.avatarURL(),
						},
						color: client.colors.base,
						title: 'Message edited',
						description: `Channel: ${newMessage.channel.toString()}\n[Message](${newMessage.url})`,
						fields,
						footer: {
							text: `uid: ${newMessage.author.id}`,
						},
					},
				});
		}
	});
};
