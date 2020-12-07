module.exports = {
	async run(message) {
		if (message.attachments.size < 1) {
			return message.channel.send('', {
				embed: {
					color: 0xff0000,
					description: 'This command only passes through images, text messages will not work.',
				},
			});
		}
		if (message.attachments) {
			let content = message.attachments.first().url;
			message.channel.send('', {
				embed: {
					color: 0xff80cc,
					description: message.content.split('!spoiler ')[1]
						? `||${message.content.split('!spoiler ')[1]}||`
						: '',
					author: {
						name: 'From: ' + message.member.displayName,
					},
				},
				files: [
					{
						attachment: content,
						name: 'SPOILER_NAME.jpg', //+ message.attachments.first().filename,
					},
				],
			});
			message.delete().catch((e) =>
				message.channel.send('', {
					embed: { color: 0xff80cc, description: 'Cannot delete message in this channel!' },
				})
			);
		}
	},
	description: 'Marks an image as a spoiler.',
	detailed: 'Marks an image as a spoiler.',
	examples: (prefix) => `${prefix}spoiler <attached image>`,
	name: 'Spoiler',
	guildOnly: true,
};
