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
		//help += '***help***\nHelp command, gets a list of commands or specific info about a command.\n\n';
		help.push({name: 'system', value: 'help\nHelp command, gets a list of commands or specific info about a command.\n\n'});
		commands.help = {
			run: (message, args)=>{
				if(commands[args[1]])//return command specific info if available
					message.channel.send('', {embed: {description:  `**${commands[args[1].toLowerCase()].name}**\nDescription:\n${commands[args[1].toLowerCase()].detailed}\nExample(s):\n${commands[args[1].toLowerCase()].examples}`}});
				//send a message to the user with all commands and desriptions
				message.author.send({embed: {title: '**Command list**', description: `A list over all the commands the bot has.\nThese can be used by ${prefix}{commandname} or dming this bot the command.\nFor command sepcific info add the name of the command after help.`, fields: help}});
				//if message sent in guild notify that info is sent directly
				if(message.guild) message.channel.send('', {embed: {title: '**Command list**', description: `${message.author} you have been sent a direct message with a command list.`}});
			},
			description: 'Help command.',
			detailed: 'Help command, gets a list of commands or specific info about a command.',
			examples: prefix => `${prefix}help, ${prefix}help [command_name]`,
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
				category.value += `${cmd.name}:\n${cmd.description}\n\n`;
			}
		})
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
		args = message.content.split(/\W/);
	}else{
		//split into arguments and remove prefix
		args = message.content.slice(prefix.length).split(/\W/);
	}
	//check existance of command
	if(!commands[args[0].toLowerCase()]) return;
	//check permission
	if(commands[args[0].toLowerCase()].perms){
		let lacking = [];
		console.log('checking perms')
		commands[args[0].toLowerCase()].perms.forEach(perm => {
			if(!message.member.hasPermission(perm, null, true, true))
				lacking.push(perm);
		})
		if(lacking])
			return message.channel.send('', {embed: {title: 'You lack the necessary permissions to use this command!', description: `You are lacking the following permission(s): ${lacking.join('\n')}`}});
	}
	//run command
	commands[args[0].toLowerCase()].run(message, args);
};

module.exports = {handle: handle, init: initializer};
