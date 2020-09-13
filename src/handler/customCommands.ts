import * as Discord from 'discord.js';

type action = 'mute' | 'giveRole' | 'addRole' | 'removeRole' | 'toggleRole';

type Action = {
	action: action;
	target: string;
	option: string;
};

type Field = {
	title?: string;
	name?: string;
	description?: string;
	value?: string;
	short?: boolean;
	inline?: boolean;
};

type Image = {
	url?: string;
};

type Embed = {
	author?: Discord.MessageEmbedAuthor;
	author_url?: string;
	author_icon?: string;
	thumbnail?: Image;
	title?: string;
	message_title?: string;
	colour?: string | number;
	color?: string | number;
	description?: string;
	image?: Image;
	actions?: Action[];
	footer?: {text?: string, iconURL?: string};
	footer_icon?: string;
	fields?: Field[];
};

type customCommand = {
	name: string;
	message?: string;
	image?: string;
	permissions?: Discord.PermissionString[] | string[];
	requires?: {mentions: number};
	embed?: Embed;
	insufficientMentions?: Embed;
	insufficientPermissions?: Embed;
	actions?: Action[];
};

type runableCommand = {
	message?: string;
	image?: string;
	embed?: Discord.MessageEmbed;
	actions?: Action[];
	files?: string[];
};

let colors = {
	error: 0xFF0000
}

const resolutions = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
function replacer(snippet: string, member: Discord.GuildMember){
	if(!member)
		return undefined;
	return (()=>{
	switch (snippet){
		case 'id':
			return member.id;
		case 'nickname':
			return member.displayName;
		case 'tag':
			return member.user.tag;
		case 'username':
			return member.user.username
		default:
			if(snippet && snippet.startsWith('pfp')){
				let num = parseInt(snippet.replace(/\D/g, ''))||128;
				num = resolutions.includes(num) ? num : 128;
				return member.user.displayAvatarURL({
					format: 'png',
					dynamic: true,
					//	@ts-ignore
					size: num
				})
			}
			return member.toString();
	}})().replace(/"/g, '\\"');
}

const pattern = /\((mentions?|author)\.?(nth\(\d+\)|first|last|all)?\.?(id|mention|nickname|tag|username|pfp\(\d{0,4}\))?\)/gi;

const splitPattern = /\w+(\(\d*\))?/g;

function parseCommand(command: string, message: Discord.Message): string{
	return command.replace(pattern, match=>{
		let arr = match.toLowerCase().match(splitPattern);
		if(arr[0]=='author')
			return replacer(arr[arr.length-1], message.member);
		switch(arr[1]){
			case 'all':
				return message.mentions.members.reduce((acc, curr)=>acc + replacer(arr[arr.length-1], curr) + ', ', ''). replace(/, $/, '');
			case 'first':
				return replacer(arr[arr.length-1], message.mentions.members.first());
			case 'last':
				return replacer(arr[arr.length-1], message.mentions.members.last());
			default:
				if(arr[1].startsWith('nth') || arr.length>2){
					return replacer(arr[arr.length-1], message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, ''))-1] || message.mentions.members.last());
				}
				else
					return replacer(arr[arr.length-1], message.mentions.members.first());
		}
	});
}

import { mute as Mute } from  './mute';
const mute = Mute.mute;
import { convertTime } from './utils';

function takeAction(message: Discord.Message, member: Discord.GuildMember, action: action, option: string): void{
	switch (action){
		case 'mute':
			let time = convertTime(option);
			if(isNaN(time))
				time = undefined;
			mute(message.guild, member, time, 'Custom command test', message.member)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to mute user',
					description: e.message||e,
					color: colors.error
				}})
			);
			break;

		case 'toggleRole':
			if(member.roles.cache.get(option)){
				takeAction(message, member, 'removeRole', option);
				break;
			}
		case 'addRole':
			member.roles.add(option)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to remove role',
					description: 'Check bot permissions and hierarchical position.',
					color: colors.error
				}})
			);
			break;
		case 'removeRole':
			member.roles.remove(option)
			.catch(e=>
				message.channel.send({embed:{
					title: 'Unable to remove role',
					description: 'Check bot permissions and hierarchical position.',
					color: colors.error
				}})
			);
			break;
	}
}

import { isArray } from 'util';

const errorEmbed = {embed:{
	title: 'Custom command returned empty',
	description: `Please see [custom command documentation](${require('../../package.json').repository.url.replace('git+', '').replace('.git', '')}/blob/master/docs/custom_commands.md) or refer server admins there.`
}};

function runCustomCommand(customCommand: string, message: Discord.Message){
	let command: runableCommand = JSON.parse(parseCommand(customCommand, message));
	if(command.actions){
		if(!isArray(command.actions))
			command.actions = JSON.parse(command.actions);

		if(isArray(command.actions)&&command.actions[0])
			command.actions.forEach(action =>{
				if(!(action.target||action.action||action.option))
					return;
				const arr = action.target.split('.');
				if(arr[0]=='author')
					takeAction(message, message.member, action.action, action.option)
				else
					switch(arr[1]){
						case 'all':
							message.mentions.members.each(member=>takeAction(message, member, action.action, action.option));
							break;
						case 'first':
							takeAction(message, message.mentions.members.first(), action.action, action.option);
							break;
						case 'last':
							takeAction(message, message.mentions.members.last(), action.action, action.option);
							break;
						default:
							if(arr[1].startsWith('nth'))
								takeAction(message, message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, ''))-1] || message.mentions.members.last(), action.action, action.option)
							else
								takeAction(message, message.mentions.members.first(), action.action, action.option);
					}
			});
	}
	let msg: Discord.MessageOptions = {};
	if(Object.keys(command.embed).length)
		msg.embed = command.embed;
	if(command.image)
		msg.files = [command.image];
	if(msg.embed||(msg.files&&msg.files[0]))
		message.channel.send(command.message, msg);
	else if(command.message)
		message.channel.send(command.message);
	else
		message.channel.send(errorEmbed);
}

function processEmbed(input: any): Embed{
	if(!input) return {};
	let embed: Embed = {author: {},footer:{},thumbnail: {},image: {},fields: []};

	if(input.author&&typeof(input.author)=='string')
		embed.author.name = input.author;
	else if(input.author&&typeof(input.author)=='object'){
		if(input.author.name&&typeof(input.author.name)=='string')
			embed.author.name = input.author.name;

		if(input.author.url&&typeof(input.author.url)=='string')
			embed.author.url = input.author.url;

		if(input.author.iconURL&&typeof(input.author.iconURL)=='string')
			embed.author.iconURL = input.author.iconURL;
	}
	if(input.author_url&&typeof(input.author_url)=='string')
		embed.author.url = input.author_url;

	if(input.author_icon&&typeof(input.author_icon)=='string')
		embed.author.iconURL = input.author_icon;

	if(input.title&&typeof(input.title)=='string')
		embed.title = input.title;
	else if(input.message_title&&typeof(input.message_title)=='string')
		embed.title = input.message_title;

	if(input.description&&typeof(input.description)=='string')
		embed.description = input.description;

	if(input.colour&&typeof(input.colour)=='string')
		embed.color = parseInt(input.colour.replace('#', ''), 16);

	if(input.thumbnail&&typeof(input.thumbnail)=='string')
		embed.thumbnail.url = input.thumbnail;
	else if(input.thumbnail&&typeof(input.thumbnail)=='object'&&input.thumbnail.url&&typeof(input.thumbnail.url)=='string')
		embed.thumbnail.url = input.thumbnail.url;

	if(input.image&&typeof(input.image)=='string')
		embed.image.url = input.image;
	else if(input.image&&typeof(input.image)=='object'&&input.image.url&&typeof(input.image.url)=='string')
		embed.image.url = input.image.url;

	if(input.footer&&typeof(input.footer)=='string')
		embed.footer.text = input.footer;
	else if(input.footer&&typeof(input.footer)=='object'){
		if(input.footer.text&&typeof(input.footer.text)=='string')
			embed.footer.text = input.footer.text;

		if(input.footer.iconURL&&typeof(input.footer.iconURL)=='string')
			embed.footer.iconURL = input.footer.iconURL;
	}

	if(input.footer_icon&&typeof(input.footer_icon)=='string')
		embed.footer.iconURL = input.footer_icon;

	if(input.fields&&isArray(input.fields)){
		let len = Math.min(input.fields.length, 25);
		for (let i = 0; i < len; i++) {
			const field = input.fields[i];
			if(field && typeof(field)=='object' && (field.name || field.title || field.description || field.value))
				embed.fields.push({
					name: field.name || field.title,
					value: field.description || field.value,
					inline: field.short || field.inline || false
				});
		}
	}
	if(!Object.keys(embed.author).length)
		delete embed.author;
	if(!Object.keys(embed.footer).length)
		delete embed.footer;
	if(!Object.keys(embed.thumbnail).length)
		delete embed.thumbnail;
	if(!Object.keys(embed.image).length)
		delete embed.image;
	if(!Object.keys(embed.fields).length)
		delete embed.fields;
	return embed;
}

const customCommandSQL = `INSERT OR REPLACE INTO customCommands(
	guild,
	source,
	name,
	command,
	permissions,
	requires,
	insufficientPermissions,
	insufficientMentions
)
VALUES ((?),(?),(?),(?),(?),(?),(?),(?))`;

import { permissionsFlags } from './utils';
import  {asyncDB} from './utils';
const {run, get, all} = asyncDB;

import * as sqlite from 'sqlite3';
const sqlite3 = sqlite.verbose();

let db = new sqlite3.Database(`${__dirname}/store.db`, (err) => {
	if (err) {
		return console.error(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS customCommands(guild TEXT NOT NULL, source TEXT NOT NULL, name TEXT NOT NULL, command TEXT NOT NULL, permissions TEXT, requires TEXT, insufficientPermissions TEXT, insufficientMentions TEXT);');

async function runCommandIfExists(command: string, message: Discord.Message): Promise<void>{
	let customCommand = await get(db, 'SELECT * FROM customCommands WHERE guild = (?) AND name = (?);', [message.guild.id, command]);
	if(!(customCommand && customCommand.name))
		return;
	if(customCommand.permissions){
		let perms = JSON.parse(customCommand.permissions);
		if(perms&&isArray(perms)){
			let lacking = [];
			perms.forEach(perm => {
				if(!message.member.hasPermission(perm))
					lacking.push(perm);
			});
			if(lacking[0]){
				if(customCommand.insufficientPermissions)
					runCustomCommand(customCommand.insufficientPermissions, message);
				else
					message.channel.send('', {embed: {
						title: 'You lack the necessary permissions to use this command',
						color: colors.error,
						fields: [{
							name: 'Missing permission(s)',
							inline: false,
							value: lacking.reduce(
								(accumulator, currentValue) => `${accumulator}, ${currentValue}`
							).toLowerCase().replace(/_/g, ' ')
						}]
					}});
				
				return;
			}
		}
	}
	if(customCommand.requires){
		let mentions = Number((JSON.parse(customCommand.requires)||{}).mentions)||0;
		if(message.mentions.members.array().length<mentions){
			if(customCommand.insufficientMentions)
				runCustomCommand(customCommand.insufficientMentions, message);
			else
				message.channel.send('', {embed: {
					title: 'Too few mentions',
					color: colors.error
				}});
			return;
		}
	}
	runCustomCommand(customCommand.command, message);
}

async function fetchCommands(guild: string){
	let commands = (await all(db, 'SELECT source FROM customCommands WHERE guild = (?);', [guild]));
	if(commands[0])
	for (let i = 0; i < commands.length; i++) {
		commands[i]=JSON.parse(commands[i].source);
	}
	return commands;
}

async function createCommand(command: customCommand, guild: string): Promise<void>{
	return new Promise(function (resolve, reject){
		if(!command)
			return reject('Incomplete command');
		let embed = processEmbed(command.embed)
		if(!(embed.title||embed.description||(embed.fields&&embed.fields[0])||(embed.thumbnail&&embed.thumbnail.url)||(embed.image&&embed.image.url)||(embed.image&&typeof(embed.image)=='string')))
			return reject('Incomplete command');

		if(!command.name)
			return reject('Incomplete command');

		let permissions = processEmbed(command.insufficientPermissions);
		if(!(permissions.title||permissions.description||(permissions.fields&&permissions.fields[0])||(permissions.thumbnail&&permissions.thumbnail.url)||(permissions.image&&permissions.image.url)))
			permissions = null;

		let mentions = processEmbed(command.insufficientMentions);
		if(!(mentions.title||mentions.description||(mentions.fields&&mentions.fields[0])||(mentions.thumbnail&&mentions.thumbnail.url)||(mentions.image&&mentions.image.url)))
			mentions = null;

		command.permissions = (isArray(command.permissions)&&command.permissions[0]?command.permissions:null);
		if(command.permissions){
			command.permissions = command.permissions.filter(perm => typeof(perm)==='string'&&permissionsFlags[perm.toLowerCase()]!=undefined);
			for (const i in command.permissions)
				command.permissions[i] = command.permissions[i].toUpperCase();
		}
		run(db, 'DELETE FROM customCommands WHERE guild = (?) AND name = (?);', [guild, command.name])
			.then(async()=>{
				await run(db, customCommandSQL, [
					guild,
					JSON.stringify(command),
					command.name.toLowerCase(),
					JSON.stringify({
						image: (command.image&&typeof(command.image)=='string')?command.image:null,
						message: (command.message&&typeof(command.message)=='string')?command.message:null,
						embed: embed,
						actions: (isArray(command.actions)&&command.actions[0]?JSON.stringify(command.actions):null)
					}),
					JSON.stringify(command.permissions),
					(typeof(command.requires)=='object'&&command.requires.mentions?JSON.stringify(command.requires):null),
					permissions?JSON.stringify({embed: permissions, actions: command.insufficientPermissions.actions}):null,
					mentions?JSON.stringify({embed: mentions, actions: command.insufficientMentions.actions}):null
				]).then(()=>resolve())
				.catch(()=>reject('Internal server error'));
			})
			.catch(()=>reject('Internal server error'));
	})
}

async function deleteCommand(guild: string, command: string): Promise<void>{
	return new Promise(function (resolve, reject){
		run(db, 'DELETE FROM customCommands WHERE guild = (?) AND name = (?);', [guild, command])
			.then(()=>resolve())
			.catch(e=>reject(e));
	});
}

export { createCommand, deleteCommand, processEmbed, runCommandIfExists, fetchCommands };