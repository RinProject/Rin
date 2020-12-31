import { Guild } from '../../database';
import { Command } from '../command';

export = new Command({
	run: async function ({ channel, guild, client }, args, colors) {
		if (args.length < 2)
			channel.send({
				embed: {
					title: 'Incorrect command usage',
					description: (this as Command).examples,
					color: colors.error,
				},
			});
		else {
			const g = await Guild.findOne({ id: guild.id });
			const status = g.disabledCommands.get(client.aliasToCommand(args[1]));

			channel.send({
				embed: status
					? status.guild
						? { title: 'Command disabled', color: colors.base }
						: {
								title: 'Command disabled in',
								description: status.channels.reduce((acc, id) => acc + `<#${id}>\n`, ''),
								color: colors.base,
						  }
					: { title: 'Command enabled', color: colors.base },
			});
		}
	},
	name: 'CommandEnabled',
	aliases: ['Enabled', 'CommandDisabled', 'Disabled'],
	description: 'Displays whether or not a command is enabled.',
	detailed: 'Tell you whether or not a given command is enabled or not.',
	examples: [(prefix) => `${prefix}enabled ping`],
});
