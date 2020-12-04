import { Command } from '../command';

export = new Command({
	run: async function (message, args) {
		if (!args[1]) {
			message.channel.send('Please provide a command to enable / disable');
			return;
		}

		const command = message.client.getCommand(args[1] || '');
		if (!command) {
			message.channel.send('`Command not found.`');
			return;
		}

		if (command.name == 'ToggleCommand') {
			message.channel.send('`Operation not allowed, command can not be disabled.`');
			return;
		}

		if (args[0] == 'enable' || args[0] == 'enableCommand')
			message.client.enableCommand(message.guild.id, command.name);
		else if (args[0] == 'disable' || args[0] == 'disableCommand')
			message.client.disableCommand(message.guild.id, command.name);
		else
			(await this.enabledIn(message.guild.id))
				? message.client.disableCommand(message.guild.id, command.name)
				: message.client.enableCommand(message.guild.id, command.name);
	},
	description: 'Enables/disables commands.',
	detailed:
		'Toggles whether or not a command is available in a server. If called explicitly with enable/disable it will always enable or disable the given command according to the used keyword.',
	examples: [
		(prefix) => `${prefix}toggle [command]`,
		(prefix) => `${prefix}disable [command]`,
		(prefix) => `${prefix}enable [command]`,
	],
	name: 'ToggleCommand',
	aliases: ['DisabledCommands', 'Toggle', 'Disable', 'Enable', 'DisableCommand', 'EnableCommand'],
	permissions: ['ADMINISTRATOR'],
});
