import * as Discord from 'discord.js';
import { Client } from './client';
import { Command, command } from './command';

export class Help extends Command {
	private data: Command[];
	private commandMap: Map<string, Command>;
	private commandAliases: Map<string, string>;
	constructor(
		prefix: string,
		commands: Map<string, Command>,
		aliases: Map<string, string>,
		commandData: Command[],
		client: Client
	) {
		super(
			{
				run: async function (message: Discord.Message, args: string[], colors) {
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
								color: colors.base,
							},
						});
						return;
					}
					message.author.send({
						embed: {
							title: 'Command list',
							fields: this.data,
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
				description: 'Help command',
				detailed: 'Help command, gets a list of commands or info about a specific command.',
				examples: (prefix) => `${prefix}help, ${prefix}help [command]`,
			},
			prefix,
			'System',
			client
		);
		this.data = commandData;
		this.commandMap = commands;
		this.commandAliases = aliases;
	}
}

export class Reload extends Command {
	private reload: () => void;
	private reloadCommand: (alias: string) => void;

	constructor(
		prefix: string,
		reload: () => void,
		reloadCommand: (alias: string) => void,
		client: Client
	) {
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
			'System',
			client
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

export const Prefix: command = {
	run: async function (message, args, colors) {
		if (!args[1])
			message.channel.send({
				embed: {
					title: 'Current prefix is',
					description: message.client.prefixFor(message.guild.id),
					color: colors.base,
				},
			});
		else if (message.member.hasPermission('ADMINISTRATOR', { checkOwner: true }))
			message.client
				.setPrefix(message.guild.id, args[1])
				.then(() =>
					message.channel.send({
						embed: { title: 'Prefix set to', description: args[1], color: colors.success },
					})
				)
				.catch(() =>
					message.channel.send({
						embed: {
							title: 'Unable to set prefix',
							description: 'Internal error',
							color: colors.error,
						},
					})
				);
		else
			message.channel.send({
				embed: {
					title: 'Insufficient permissions',
					description: 'Only Administrators may change the prefix',
					color: colors.error,
				},
			});
	},
	description: 'Changes or displays the servers prefix',
	detailed: 'Change the prefix of a server or reset it.',
	examples: (prefix) => `${prefix}prefix ;`,
	name: 'prefix',
	guildOnly: true,
};

import https = require('https');
import url = require('url');

async function fetchCommand(uri: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const link = url.parse(uri);

		const req = https.request(
			{
				hostname: link.hostname,
				path: link.path,
				method: 'GET',
			},
			function (res) {
				let str = '';

				res.on('data', (d) => {
					str += d;
				});

				res.on('end', function () {
					resolve(str);
				});
			}
		);

		req.on('error', (error) => {
			reject(error);
		});

		req.end();
	});
}

import { createCommand, deleteCommand } from './customCommands';

export const CustomCommand: command = {
	run: async function (message, args, colors, prompt) {
		if (!args[1]) {
			message.channel.send({
				embed: {
					title: 'Custom Command List',
					description:
						'If you wish too see a list of custom commands use the `customCommand` command.',
				},
			});
		} else
			switch (args[1].toLowerCase()) {
				case 'add':
				case 'create': {
					message.channel.send({
						embed: {
							title: 'Please provide a custom command',
							description:
								'Custom commands can be provided as a message or a link to a raw GitHub gist.\n' +
								'See documentation for further info om how to construct a custom command.',
							color: colors.base,
						},
					});
					const commandMessage = await prompt({
						user: message.author.id,
						channel: message.channel.id,
					});

					const command = commandMessage.content.match(
						/^https:\/\/gist.githubusercontent.com\/.*?\/.*?\/raw\/(.*?\/.*\.json)?$/
					)
						? await fetchCommand(commandMessage.content)
						: commandMessage.content;
					// const command = commandMessage.content;

					createCommand(JSON.parse(command), commandMessage.guild.id)
						.then((command) =>
							message.channel.send({
								embed: {
									title: 'Command created',
									description: `${command.name} successfully created.`,
									color: colors.success,
								},
							})
						)
						.catch((e) =>
							message.channel.send({
								embed: {
									title: 'An error occurred, command not created',
									description: e.message || e,
									color: colors.error,
								},
							})
						);
					break;
				}
				case 'remove':
				case 'delete': {
					const command =
						args[2] ||
						(message.channel.send({
							embed: {
								title: 'Please provide a command',
								description: 'Type the name of the command you wish to delete in chat.',
								color: colors.base,
							},
						}),
						await prompt({ user: message.author.id, channel: message.channel.id })).content;

					deleteCommand(message.guild.id, command)
						.then((command) =>
							message.channel.send({
								embed: {
									title: 'Command deleted',
									description: `${command} successfully created.`,
									color: colors.success,
								},
							})
						)
						.catch((e) =>
							message.channel.send({
								embed: {
									title: 'An error occurred, command may not be deleted',
									description: e.message || e,
									color: colors.error,
								},
							})
						);
					break;
				}
			}
	},
	description: 'Changes or displays the servers prefix',
	detailed: 'Change the prefix of a server or reset it.',
	examples: (prefix) => `${prefix}prefix ;`,
	name: 'CustomCommand',
	guildOnly: true,
};
