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

import { Command } from '../command';
import { createCommand, deleteCommand } from '../customCommands';

export = new Command({
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
});
