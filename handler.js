'use strict';
const fs = require('fs');

let commands;
let help = [];
let prefix = '';

//intializes commands
function initializer(config){
	commands = {};
	prefix = config.prefix||'!';
	//add help command if wanted
	if(config.help || config.help == undefined){
		help.push({name: 'system', value: 'help: Help command, gets a list of commands or specific info about a command.\n\n'});
		commands.help = {
			run: async function (message, args){
				if(commands[args[1]])//return command specific info if available
					return message.channel.send('', {embed: {description:  `**${commands[args[1].toLowerCase()].name}**\nDescription:\n${commands[args[1].toLowerCase()].detailed}\nExample(s): \`${commands[args[1].toLowerCase()].examples}\``}});
				//send a message to the user with all commands and desriptions
				message.author.send({embed: {title: '**Command list**', description: `A list over all the commands the bot has.\nFor specific command info ${prefix}help [command_name]`, fields: help}});
				//if message sent in guild notify that info is sent directly
				if(message.guild) message.channel.send('', {embed: {title: '**Command list**', description: `${message.author} you have been sent a direct message with a command list.`}});
			},
			description: 'Help command',
			detailed: 'Help command, gets a list of commands or specific info about a command.',
			examples: `${prefix}help, ${prefix}help [command_name]`,
			name: 'help',
			perms: null,
		}
	}

	//check every file in commands directory and imports all commands
	fs.readdirSync(config.directory).forEach(item => {
		//Add command group to help file
		let category = {name:`${item}\n\n`, value: ''};
		//checks that it's going into a directory
		if(!fs.lstatSync(`${config.directory}/${item}`).isDirectory())return;
		//reads every file
		fs.readdirSync(`${config.directory}/${item}`).forEach(path => {
			//checks that it is a .js file
			if(fs.lstatSync(`${config.directory}/${item}/${path}`).isFile() && path.toLowerCase().endsWith('.js')){
				//imports command
				let cmd = require(`${config.directory}/${item}/${path}`);
				//checks that command doesn't already exist
				if(commands[cmd.name]) throw 'You may not register the same command twice';
				//creates example
				cmd.examples = cmd.examples(prefix);
				//adds command to commands object
				commands[cmd.name] = cmd;
				//adds to help command list
				category.value += `${cmd.name}: ${cmd.description}\n\n`;
			}
		});
		//Only push folders with commands to help command display
		if(category.value)
			help.push(category);
	});
};

//checks command command
function handle(message){
	let args;
	//check if it's a command or sent in dms
	if(!message.content.startsWith(prefix)){
		if(message.guild) return;
		//split into arguments
		args = message.content.split(/\s/);
	}else{
		//split into arguments and remove prefix
		args = message.content.slice(prefix.length).split(/\s/);
	}
	args = args.filter(str => str);
	//check existance of command
	if(!commands[args[0].toLowerCase()]) return;
	//check permission
	if(commands[args[0].toLowerCase()].perms){
		let lacking = [];
		commands[args[0].toLowerCase()].perms.forEach(perm => {
			if(!message.member.hasPermission(perm))
				lacking.push(perm);
		});
		if(lacking[0])
			return message.channel.send('', {embed: {title: 'You lack the necessary permissions to use this command!', description: `You are lacking the following permission(s): ${lacking.join('\n')}`}});
	}
	//run command
	commands[args[0].toLowerCase()].run(message, args);
};

module.exports = {handle: handle, init: initializer};
