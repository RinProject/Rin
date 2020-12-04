module.exports = {
	async run(message, args, colors) {
		if (args[1] == undefined) {
			return message.channel.send('', {
				embed: {
					description: 'Please provide a message for the bot to say.',
					color: colors.error,
				},
			});
		}

		message.delete().catch((e) => e);
		return message.channel.send(args.splice(1).join(' '));
	},
	description: 'Says a given message.',
	detailed: 'Has the bot say a message in the same channel.',
	examples: (prefix) => `${prefix}say Soze is an epic gamer!`,
	name: 'Say',
	permissions: ['ADMINISTRATOR'],
};
