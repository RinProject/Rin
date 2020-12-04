import { Command } from '../command';

export = new Command({
	run: async function (message, args) {
		if (this.client.isOwner(message.author.id)) {
			const alias = args[1] || '';
			if (alias) {
				message.client.reloadSingle(alias);
				message.channel.send(`\`Reloaded ${alias}\``);
				return;
			}
			message.client.loadCommands();
			message.channel.send('Commands reloaded.');
		}
	},
	name: 'Reload',
	description: 'Reload one or several commands(owner only).',
	detailed:
		'Reload a specific command or all of the commands, this command is only usable by owners.',
	examples: [(prefix) => `${prefix}reload`, (prefix) => `${prefix}reload pat`],
});
