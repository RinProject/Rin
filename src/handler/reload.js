'use strict';

module.exports = {
	run: async function (message, args) {
		if(this.owners.includes(message.author.id)){
			if(args[1]){
				let command = this.commandAliases[args[1].toLowerCase()];
				if(command){
					this.reloadCommand(this.commands[command].path);
					return message.channel.send(`\`Reloaded ${command}\``);
				}
			}
			this.reload();
			message.channel.send('Commands reloaded.');
		}
	},
	description: 'Reloads commands',
	detailed: 'Reloads commands',
	examples: prefix => `${prefix}reload, ${prefix}reload hug`,
	name: 'reload',
	guildOnly: true
};
