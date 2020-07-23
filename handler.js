'use strict';
const fs = require('fs');
const https = require('https');
const { cpuUsage } = require('process');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/handler.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

let commands;
let commandAliases;
let help = [];
let prefix = '';
let webhook;
let owners;

/** 
 * Initialize command handler
 * 
 * @param {object} config options
 * @param {string} config.prefix bot prefix
 * @param {string} config.directory command top level directory
 * @param {boolean} [config.help=true] whether to include help command
 * @param {string[]} config.owners an array of owners
 * @param {string} config.webhook webhook url for login errors
 * @param {object} client the active discord.js client
 * @returns {void}
 */
function initializer(config, client){
	if(config.owners==undefined)
		throw 'No owners registered';
	if(!config.webhook)
	{
		console.warn('No logging webhook provided, bot will default to telling users to contact owners.');
		let errorText = `\`You shouldn't see this, an error has occurred and any output is likely corrupted. Contact${config.owners.length>1?" any of the following;":':'} ${
		(()=>{
			let accumulator = '';
			config.owners.forEach(current=>{
				const owner = client.users.cache.get(current);
				accumulator+=`${owner.tag}, `;
			});
			return accumulator.replace(/, $/, '');
		})()}\``;
		handleError = function (err, message){
			message.channel.send(errorText);
			console.error(err);
		}
	} else {
		webhook = config.webhook.match(/\/slack$/) ? 
		config.webhook.replace(/^https:\/\/discordapp.com/, '') : 
		config.webhook.replace(/^https:\/\/discordapp.com/, '') + '/slack';
	}

	owners = config.owners;
	prefix = config.prefix||'!';
	loadCommands(config);
};

/**
 * 
 * @param {object} commandPath 
 * @param {object} commands 
 * @param {object} commandAliases 
 * @param {boolean} reload 
 */

function loadCommand(commandPath, commands, commandAliases, reload){
	delete require.cache[require.resolve(commandPath)];
	let command = require(commandPath);
	const name = command.name.toLowerCase();
	if(reload){
		if(command.aliases)
			command.aliases.forEach(alias=>{
				if(commandAliases[alias]==name)
					delete commandAliases[alias];
			});	
		delete commands[name];
		delete commandAliases[name];
	}
	//checks that command doesn't already exist
	if(commands[name])
		throw `You may not register the same command twice. Command: ${name} registered twice.`;
	if(commandAliases[name])
		throw 'You may not a command with the name or alias of another command';
	//creates example
	command.examples = command.examples(prefix);

	//adds command to commands object
	commandAliases[name] = command.name;
	commands[command.name] = command;
	
	if(command.aliases){					
		command.aliases.forEach(alias=>{
			if(commandAliases[alias])
				throw 'You may not register the same alias twice';
			commandAliases[alias.toLowerCase()]=command.name;
		});
		command.aliases = command.aliases.reduce(
			(accumulator, currentValue) => `${accumulator}, ${currentValue}`
		);
	}
	command.path=commandPath;
	return command;
}

/** 
 * Loads / reloads commands
 * 
 * @param {object} config options
 * @param {string} config.directory command top level directory
 * @param {boolean} [config.help=true] whether to include help command
 * @returns {void}
 */
function loadCommands(config){
	if(!prefix)
		throw 'You must initialize before loading commands';
	let tempCommands = {};
	let tempCommandAliases = {};
	//add help command if wanted
	if(config.help || config.help === undefined){
		help.push({
			name: 'system',
			value: '*help:* Help command, gets a list of commands or specific info about a command.\n\n'
			+ '*prefix:* Changes server prefix\n\n'
			+ '*toggleCommand:* Toggles command availability in a server.'
		});
		loadCommand('./handler/help', tempCommands, tempCommandAliases, false);
		tempCommands.help.help = help;
		tempCommands.help.commands = tempCommands;
		tempCommands.help.commandAliases = tempCommandAliases;
		tempCommands.help.prefix = prefix;

		loadCommand('./handler/prefix', tempCommands, tempCommandAliases, false);

		loadCommand('./handler/reload', tempCommands, tempCommandAliases, false);
		tempCommands.reload.reload = ()=>loadCommands(config);
		tempCommands.reload.reloadCommand = (path)=>loadCommand(path, commands, commandAliases, true);
		tempCommands.reload.commands = tempCommands;
		tempCommands.reload.commandAliases = tempCommandAliases;
		tempCommands.reload.owners = owners;

		loadCommand('./handler/toggle', tempCommands, tempCommandAliases, false);
		tempCommands.toggleCommand.commandAliases = tempCommandAliases;
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
				const commandPath = `${config.directory}/${item}/${path}`;
				let command = loadCommand(commandPath, tempCommands, tempCommandAliases, false);
				//adds to help command list
				category.value += `\n*${command.name}:* ${command.description}\n`;
			}
		});
		//Only push folders with commands to help command display
		if(category.value)
			help.push(category);
	});
	commands = tempCommands;
	commandAliases = tempCommandAliases;
	console.log('Commands loaded');
}

/**
 * 
 * @param {string} guild id of guild to fetch the prefix of 
 */
async function fetchPrefix(guild) {
	return new Promise(function (resolve, reject) {
		db.get('SELECT prefix FROM prefixes WHERE guild = (?)', [guild], function (error, row) {
			if (error)
				reject(error);
			else
				resolve(row?row.prefix:undefined);
		});
	});
}

/**
 * 
 * @param {string} guild id of guild to fetch the prefix of 
 */
async function commandDisabled(guild, command) {
	return new Promise(function (resolve, reject) {
		db.get('SELECT guild FROM disabledCommands WHERE guild = (?) AND command = (?)', [guild, command], function (error, row) {
			if (error)
				reject(error);
			else
				resolve(Boolean(row));
		});
	});
}

/**
 * Runs message through command handler.
 * @param {object} message
 * @returns {boolean} whether a command was triggered
 */
async function handle(message){
	let localPrefix = message.guild ? await fetchPrefix(message.guild.id)||prefix:prefix;
	if(message.author.bot || !message.content.startsWith(localPrefix)) return false;
	//split into arguments and remove prefix
	let args = message.content.slice(localPrefix.length).split(/\s+/);

	let command = commands[commandAliases[args[0].toLowerCase()]];
	if(!command) return false;
	if(await commandDisabled(message.guild.id, command.name)){
		message.channel.send('`Command disabled`');
		return true;
	}

	if(command.guildOnly&&!message.guild){
		message.channel.send({
			embed: {
				title: 'You may not use that command here',
				description: 'Command restricted to guilds, apologies for any inconvenience.',
				color: 0xcc1020
			}
		})
		return true;
	}
	//check permission
	if(command.perms){
		let lacking = [];
		command.perms.forEach(perm => {
			if(!message.member.hasPermission(perm))
				lacking.push(perm);
		});
		if(lacking[0]){
			message.channel.send('', {embed: {
				title: 'You lack the necessary permissions to use this command',
				color: 0xcc1020,
				fields: [{
					name: 'Missing permission(s)',
					inline: false,
					value: lacking.reduce(
						(accumulator, currentValue) => `${accumulator}, ${currentValue}`
					).toLowerCase().replace(/_/g, ' ')
				}]
			}});
			return true;
		}
	}
	if(command.botPerms){
		let lacking = [];
		command.botPerms.forEach(perm => {
			if(!message.guild.me.hasPermission(perm))
				lacking.push(perm);
		});
		if(lacking[0]){
			message.channel.send('', {embed: {
				title: 'I lack the necessary permissions to use this command.',
				color: 0xcc1020,
				fields: [{
					name: 'Missing permission(s)',
					inline: false,
					value: lacking.reduce(
						(accumulator, currentValue) => `${accumulator}, ${currentValue}`
					).toLowerCase().replace(/_/g, ' ')
				}],
				footer: {
					text: 'Please contact the server owner or admins to use this command.'
				},
			}});
			return true;
		}
	}
	//run command
	command.run(message, args).catch(e=>handleError(e, message));
	return true;
}

function handleError(error, message){
	if(message)
		message.channel.send("`You shouldn't see this, an error has occurred and any output is likely corrupted, developers have been informed.`");	
	const data = JSON.stringify({	
		text:"An error has occurred",	
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

module.exports = {handler: handle, init: initializer, loadCommands: loadCommands, errorLog: handleError};
