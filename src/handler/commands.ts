import * as Discord from 'discord.js';
import { Command } from './command';

export class Help extends Command {
	private data: object[];
	private commandMap: Map<string, Command>;
	private commandAliases: Map<string, string>;
	constructor(
		prefix: string,
		commands: Map<string, Command>,
		aliases: Map<string, string>,
		commandData: object[]
	) {
		super(
			{
				run: async function (message: Discord.Message, args: string[]) {
					const alias = args[1] ? args[1].toLowerCase() : '';
					if (alias && this.commandAliases.get(alias)) {
						const command = this.commandMap.get(this.commandAliases.get(alias));
						message.channel.send('', {
							embed: {
								title: command.name,
								description: `${
									command.category ? `Category: ${command.category}` : ''
								}Description:\n${command.detailed}\nExample(s): \`${command.examples}\`\n${
									command.aliases && command.aliases.length
										? `Alias(es): \`${command.aliases}\``
										: ''
								}`,
							},
						});
						return;
					}
					message.author.send({
						embed: {
							title: 'Command list',
							fields: this.data,
						},
					});

					if (message.guild)
						message.channel.send({
							embed: {
								title: '**Command list**',
								description: `${message.author} you have been sent a direct message with a command list.`,
							},
						});
				},
				name: 'Help',
				description: 'Help command',
				detailed: 'Help command, gets a list of commands or info about a specific command.',
				examples: (prefix) => `${prefix}help, ${prefix}help [command]`,
			},
			prefix,
			'System'
		);
		this.data = commandData;
		this.commandMap = commands;
		this.commandAliases = aliases;
	}
}

export class Reload extends Command {
	private reload: () => void;
	private reloadCommand: (alias: string) => void;

	constructor(prefix: string, reload: () => void, reloadCommand: (alias: string) => void) {
		super(
			{
				run: async function (message: Discord.Message, args: string[]) {
					if (this.client.isOwner(message.author.id)) {
						const alias = args[1] ? args[1].toLowerCase() : '';
						if (alias) {
							this.reloadCommand.call(this.client, alias);
							message.channel.send(`\`Reloaded ${alias}\``);
							return;
						}
						this.reload.call(this.client);
						message.channel.send('Commands reloaded.');
					}
				},
				name: 'Reload',
				description: 'Reload command(s)',
				detailed: 'Help command, gets a list of commands or info about a specific command.',
				examples: (prefix) => `${prefix}help, ${prefix}help [command]`,
			},
			prefix,
			'System'
		);
		this.reload = reload;
		this.reloadCommand = reloadCommand;
	}
}

export class Toggle extends Command {
	constructor(prefix: string) {
		super(
			{
				run: async function (message, args) {
					if (!args[1]) {
						message.channel.send('Please provide a command to enable / disable');
						return;
					}
					const command = this.commandAliases[args[1].toLowerCase()];
					if (!command) {
						message.channel.send('`Command not found.`');
						return;
					}

					if (command == 'toggleCommand') {
						message.channel.send('`Operation not allowed, command can not be disabled.`');
						return;
					}

					if (args[0] == 'enable' || args[0] == 'enableCommand')
						this.client.enableCommand(message.guild.id, command);
					else if (args[0] == 'disable' || args[0] == 'disableCommand')
						this.client.disableCommand(message.guild.id, command);
					else
						(await this.enabledIn(message.guild.id))
							? this.client.disableCommand(message.guild.id, command)
							: this.client.enableCommand(message.guild.id, command);
				},
				description: 'Toggles commands within server',
				detailed:
					'Toggles whether or not a command is available in a server. If called explicitly with enable/disable it will always enable or disable the given command according to the used keyword.',
				examples: (prefix) =>
					`${prefix}toggle [command], ${prefix}disable [command], ${prefix}enable [command]`,
				name: 'toggleCommand',
				aliases: [
					'disabledCommands',
					'toggle',
					'disable',
					'enable',
					'disableCommand',
					'enableCommand',
				],
				permissions: ['ADMINISTRATOR'],
			},
			prefix,
			'System'
		);
	}
}

const Prefix = new Command({
	run: async function (message, args) {
		if (!args[1]) {
			message.channel.send('Please provide a command to enable / disable');
		}
		const command = args[1];
		if (!command) {
			message.channel.send('`Command not found.`');
			return;
		}

		if (command == 'toggleCommand') {
			message.channel.send('`Operation not allowed, command can not be disabled.`');
			return;
		}

		try {
			if (args[0] == 'enable' || args[0] == 'enableCommand')
				await this.client.enableCommand(message.guild.id, command);
			else if (args[0] == 'disable' || args[0] == 'disableCommand')
				await this.client.disableCommand(message.guild.id, command);
			else
				(await this.client.enabledIn(message.guild.id))
					? await this.client.disableCommand(message.guild.id, command)
					: await this.client.enableCommand(message.guild.id, command);
		} catch (error) {
			message.channel.send({
				embed: {
					title: 'Unable to toggle command',
					description: 'Make sure the command is spelt correctly',
				},
			});
		}
	},
	description: 'Toggles commands within server',
	detailed:
		'Toggles whether or not a command is available in a server. If called explicitly with enable/disable it will always enable or disable the given command according to the used keyword.',
	examples: (prefix) =>
		`${prefix}toggle [command], ${prefix}disable [command], ${prefix}enable [command]`,
	name: 'toggleCommand',
	aliases: ['disabledCommands', 'toggle', 'disable', 'enable', 'disableCommand', 'enableCommand'],
	permissions: ['ADMINISTRATOR'],
});

export { Prefix };
