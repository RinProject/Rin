import { Command } from '../command';

export = new Command({
	run: async function (message, args, colors) {
		const command = message.client.getCommand(args[1] || '');
		if (command) {
			message.channel.send('', {
				embed: {
					title: command.name,
					description: command.help,
					color: colors.base,
				},
			});
			return;
		}
		message.author.send({
			embed: {
				title: 'Command list',
				fields: message.client.helpInfo,
				color: colors.base,
			},
		});

		if (message.guild)
			message.channel.send({
				embed: {
					title: '**Command list**',
					description: `${message.author} you have been sent a direct message with a command list.`,
					color: colors.base,
				},
			});
	},
	name: 'Help',
	description: 'Get help with the bot.',
	detailed: 'Help command, gets a list of commands or information about a specific command.',
	examples: [(prefix) => `${prefix}help`, (prefix) => `${prefix}help ban`],
});
