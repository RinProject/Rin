'use strict';

const packageJSON = require('../package.json');
const footerText = `Created by: ${packageJSON.author}`;
module.exports = {
	run: async function (message, args){
		if(args[1]&&this.commands[this.commandAliases[args[1].toLowerCase()]]){
			let command = this.commands[this.commandAliases[args[1].toLowerCase()]]
			return message.channel.send('', {
				embed: {
					description: `**${command.name}**\nDescription:\n${command.detailed}\nExample(s): \`${command.examples}\`\n${command.aliases?`Alias(es): \`${command.aliases}\``:''}`
				}
			});
		}
		//send a message to the user with all commands and descriptions
		message.author.send({embed:
			{
				title: '**Command list**',
				description: `A list over all the commands the bot has.\nFor specific command info ${this.prefix}help [command name]`,
				footer: {
					text: footerText
				},
				fields: this.help
			}
		});
		//if message sent in guild notify that info is sent directly
		if(message.guild) 
			message.channel.send('', {embed:
				{
					title: '**Command list**', 
					description: `${message.author} you have been sent a direct message with a command list.`
				}
			});
	},
	description: 'Help command',
	detailed: 'Help command, gets a list of commands or info about a specific command.',
	examples: prefix=>`${prefix}help, ${prefix}help [command]`,
	name: 'help',
	perms: null,
}