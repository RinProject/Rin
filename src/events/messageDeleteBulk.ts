import { Client, fetchTextChannel } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('messageDeleteBulk', async (messages) => {
		if (!messages.first().guild) return;
		const g = await Guild.findOne({ id: messages.first().guild.id });
		const channel = await fetchTextChannel(messages.first().guild, g.logChannel);

		if (!channel || !g.eventLogged('messageDeleteBulk')) return;

		const fields = [];
		messages.each((message) => {
			let content = message.content;
			if (!content)
				content = `Message data unavailable, message likely included an attachment or embed.`;
			fields.push({
				name: `${message.author.tag} | id: ${message.author.id}`,
				inline: false,
				value: content,
			});
		});

		channel.send({
			embed: {
				color: client.colors.base,
				title: 'Message bulk deletion',
				description: `${messages.size} messages were deleted in ${messages.first().channel}`,
				fields: fields,
			},
		});
	});
};
