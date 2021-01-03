import { Command } from '../command';
import { fetchCommandList } from '../customCommands';
import { permissionsFlags } from '../utils';

export = new Command({
	run: async function (message, args, colors) {
		fetchCommandList(message.guild.id).then((commands) => {
			message.channel.send({
				embed: {
					title: 'Custom Command List',
					color: colors.base,
					description: commands.reduce(
						(acc, { name, permissions, requires }) =>
							`${acc}\nName: **${name}**\nPermissions: ${
								permissions && permissions[0]
									? ' ```' +
									  permissions
											.map((perm) =>
												Object.keys(permissionsFlags)
													.find((k) => permissionsFlags[k] === perm)
													.replace('_', ' ')
													.replace(/(^| )\w/g, (match) => match.toUpperCase())
											)
											.reduce((acc, command) => `${acc}\n• ${command}`, '') +
									  '\n```'
									: '`none`'
							}\nMin mentions: \`${requires && requires.mentions ? requires.mentions : 'none'}\`\n`,
						''
					),
				},
			});
		});
	},
	name: 'CustomCommands',
	aliases: ['Customs'],
	description: 'Displays custom commands.',
	detailed: 'Displays a list of custom commands and associated information.',
	examples: [(prefix) => `${prefix}customcommands`, (prefix) => `${prefix}customs`],
	guildOnly: true,
});
