'use strict';
const fs = require('fs');
const https = require('https');

let commands;
let commandAliases;
let help = [];
let prefix = '';
let webhook;
let owners;

/** 
 * Intializes command handler
 * 
 * @param {object} config options
 * @param {string} config.prefix bot prefix
 * @param {string} config.directory command top level directory
 * @param {boolean} [config.help=true] wheter to include help command
 * @param {string[]} config.owners an array of owners
 * @param {string} config.webhook webhook url for login errors
 * @param {object} client the active discord.js client
 * @returns {void}
 */
function initializer(config, client){
	if(config.owners==undefined)
		throw 'No owners registered';
	if(config.webhook==undefined)
		throw 'No logging webhook provided, bot will default to telling users to contact owners.';

	owners = config.owners;

	webhook = config.webhook.match(/\/slack$/) ? 
	config.webhook.replace(/^https:\/\/discordapp.com/, '') : 
	config.webhook.replace(/^https:\/\/discordapp.com/, '') + '/slack';

	commands = {};
	commandAliases = {help: 'help'};
	prefix = config.prefix||'!';
	//add help command if wanted
	if(config.help || config.help === undefined){
		help.push({name: 'system', value: 'help: Help command, gets a list of commands or specific info about a command.\n\n'});
		const footerText = 'Created by: ' + (()=>{
			let acc = '';
			owners.forEach(cur=>{
				const owner = client.users.cache.get(cur);
				acc+=`${owner.username}#${owner.discriminator}, `;
			});
			return acc.replace(/, $/, '');
		})();
		commands.help = {
			run: async function (message, args){
				if(commands[args[1]])//return command specific info if available
					return message.channel.send('', {embed: {description:  `**${commands[args[1].toLowerCase()].name}**\nDescription:\n${commands[args[1].toLowerCase()].detailed}\nExample(s): \`${commands[args[1].toLowerCase()].examples}\``}});
				//send a message to the user with all commands and desriptions
				message.author.send({embed:
					{
						title: '**Command list**',
						description: `A list over all the commands the bot has.\nFor specific command info ${prefix}help [command_name]`,
						footer: {
							text: footerText
						},
						fields: help
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
				let command = require(`${config.directory}/${item}/${path}`);
				//checks that command doesn't already exist
				if(commands[command.name])
					throw 'You may not register the same command twice';
				if(commandAliases[command.name])
					throw 'You may not a command with the name or alias of another command';
				//creates example
				command.examples = command.examples(prefix);

				//adds command to commands object
				commandAliases[command.name] = command.name;
				commands[command.name] = command;
				
				if(command.aliases){					
					command.aliases.forEach(alias=>{
						if(commandAliases[alias])
							throw 'You may not register the same alias twice';
						commandAliases[alias]=command.name
					});
					command.aliases = command.aliases.reduce(
						(accumulator, currentValue) => `${accumulator}, ${currentValue}`
					);
				}
				//adds to help command list
				category.value += `**${command.name}:** ${command.description}\n\n`;
			}
		});
		//Only push folders with commands to help command display
		if(category.value)
			help.push(category);
	});
};

/**
 * Runs message through command handler.
 * @param {object} message
 * @returns {boolean} wheter a command was triggered
 */
function handle(message){
	if(message.author.bot)return false;
	let args;
	//check if it's a command or sent in dms
	if(!message.content.startsWith(prefix)){
		if(message.guild) return false;
		//split into arguments
		args = message.content.split(/\s/);
	}else{
		//split into arguments and remove prefix
		args = message.content.slice(prefix.length).split(/\s/);
	}
	args = args.filter(str => str);
	//check existance of command
	if(!commandAliases[args[0].toLowerCase()]) return false;
	let command = commands[commandAliases[args[0].toLowerCase()]];
	//check permission
	if(command.perms){
		let lacking = [];
		command.perms.forEach(perm => {
			if(!message.member.hasPermission(perm))
				lacking.push(perm);
		});
		if(lacking[0]){
			message.channel.send('', {embed: {title: 'You lack the necessary permissions to use this command!', description: `You are lacking the following permission(s): ${lacking.join('\n')}`}});
			return true;
		}
	}
	//run command
	command.run(message, args).catch(e=>handleError(e, message));
	return true;
}

function handleError(error, message){
	if(message)
		message.channel.send("`You shouldn't see this, an error has occured and any output is like corrupted, devs have been informed`");
	const data = JSON.stringify({
		text:"An error has occured",
		attachments:
		[{
			title:"Error report",
			color:"#ff4040",
			footer:`${message.author.username}#${message.author.discriminator}`,
			fields:
			[{
				title:"Trigger",
				value:message.content,
				short:true
			},
			{
				title:"Error",
				value:error.stack,short:false
			}]
		}]
	});
	const options = {
		hostname: 'discordapp.com',
		path: webhook,
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Content-Length': data.length
		}
	}

	const req = https.request(options, (res) => {});

	req.on('error', console.error);
	req.write(data);
	req.end();
}

module.exports = {handler: handle, init: initializer, errorLog: handleError};