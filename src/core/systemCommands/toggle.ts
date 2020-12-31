import { Command } from '../command';

export = new Command({
	run: async function (message, args, colors) {
		if (!args[1]) {
			message.channel.send('Please provide a command to enable / disable');
			return;
		}

		const command = message.client.getCommand(args[1] || '');
		const channel =
			message.mentions.channels.first() ||
			(args[2] ? message.guild.channels.resolve(args[2]) : undefined);
		const channelID = channel ? channel.id : undefined;

		if (!command) {
			message.channel.send('`Command not found.`');
			return;
		}

		if (command.name == 'ToggleCommand') {
			message.channel.send('`Operation not allowed, command can not be disabled.`');
			return;
		}

		function err(e: Error) {
			message.channel.send({
				embed: {
					title: 'Internal error',
					description:
						(e ? e.message : '') ||
						'Unable to update, if command is disabled globally it can not be enabled in a single channel, if the problem still persists contact bot maintainer.',
					color: colors.error,
				},
			});
		}

		if (args[0] == 'enable' || args[0] == 'enableCommand')
			message.client
				.enableCommand(message.guild.id, command.name, channelID)
				.then(() =>
					message.channel.send({
						embed: {
							title: 'Enabled command',
							description: `${command.name} enabled${channel ? ` in ${channel.name}` : ''}`,
							color: colors.success,
						},
					})
				)
				.catch(err);
		else if (args[0] == 'disable' || args[0] == 'disableCommand')
			message.client
				.disableCommand(message.guild.id, command.name, channelID)
				.then(() =>
					message.channel.send({
						embed: {
							title: 'Disabled command',
							description: `${command.name} disabled${channel ? ` in ${channel.name}` : ''}`,
							color: colors.success,
						},
					})
				)
				.catch(err);
		else
			(await message.client.enabledIn(message.guild.id, command.name, channelID))
				? message.client
						.disableCommand(message.guild.id, command.name, channelID)
						.then(() =>
							message.channel.send({
								embed: {
									title: 'Disabled command',
									description: `${command.name} disabled${channel ? ` in ${channel.name}` : ''}`,
									color: colors.success,
								},
							})
						)
						.catch(err)
				: message.client
						.enableCommand(message.guild.id, command.name, channelID)
						.then(() =>
							message.channel.send({
								embed: {
									title: 'Enabled command',
									description: `${command.name} enabled${channel ? ` in ${channel.name}` : ''}`,
									color: colors.success,
								},
							})
						)
						.catch(err);
	},
	description: 'Enables/disables commands.',
	detailed:
		'Toggles whether or not a command is available in a server. If called explicitly with enable/disable it will always enable or disable the given command according to the used keyword.',
	examples: [
		(prefix) => `${prefix}toggle [command]`,
		(prefix) => `${prefix}disable [command]`,
		(prefix) => `${prefix}enable [command] #general`,
	],
	name: 'ToggleCommand',
	aliases: ['DisabledCommands', 'Toggle', 'Disable', 'Enable', 'DisableCommand', 'EnableCommand'],
	permissions: ['ADMINISTRATOR'],
});
