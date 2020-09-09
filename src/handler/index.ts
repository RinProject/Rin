// Pass through submodules
import * as customCommands from './customCommands';
import * as utils from './utils';
import * as mute from './mute';
export { customCommands, utils, mute };

import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from './command';
import { Help, Reload, Prefix } from './commands';
import * as sqlite3 from 'sqlite3';

import * as crypto from 'crypto';

const sqlite = sqlite3.verbose();

export type Colors = {
	base?: number;
	negative?: number;
	success?: number;
	error?: number;
	[key: string]: number;
}

export interface ClientOptions extends Discord.ClientOptions {
	directory: string;	// Absolute path to commands folder
	enableCustomCommands: boolean;
	owners?: string[];	//	Bot owners as an array of id strings
	prefix?: string;	//	Default prefix
	logChannel?: string;	//	Discord channel to which errors / shall be logged
	categories?: boolean;	//	wether or not to read direct child directories as categories
	colors?: Colors;	//	color variables that can be used in command
}

type reportInfo = {
	title?: string;
	description?: string;
	color?: number;
	mention?: boolean;
};

let db = new sqlite3.Database(`${__dirname}/store.db`, function(err){
	if(err)
		throw err;
});

import { runCommandIfExists } from './customCommands';

const PREFIX = {
	async set(guild: string, prefix: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			db.run('INSERT OR REPLACE INTO prefixes(guild, prefix) VALUES((?), (?));', [guild, Prefix], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	},

	async get(guild: string): Promise<string>{
		return new Promise((resolve, reject)=>{
			db.get('SELECT prefix FROM prefixes WHERE guild = (?)', [guild], (err, row)=> {
				if (err)
					reject(err);
				resolve(row?row.prefix:null);
			});
		});
	}
}

export const commandUtils = {
	async disableCommand(guild: string, command: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			command = this.aliases.get(command.toLowerCase());
			if(command == 'toggleCommand')
				reject(new Error('Incorrect usage'));
			db.run('INSERT OR REPLACE INTO FROM disabledCommands WHERE guild = (?) AND command = (?);', [guild, command], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	},

	async enableCommand(guild: string, command: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			db.run('DELETE FROM disabledCommands WHERE guild = (?) AND command = (?);', [guild, command], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	},

	async enabledIn(guild: string, command: string): Promise<boolean>{
		return new Promise((resolve, reject)=>{
			command = this.aliases.get(command.toLowerCase());
			db.get('SELECT * FROM disabledCommands WHERE guild = (?) AND command = (?)', [guild, command], (err, row)=> {
				if (err)
					reject(err);
				resolve(!Boolean(row));
			});
		});
	},

	async allDisabledIn(guild: string): Promise<any[]>{
		return new Promise((resolve, reject)=>{
			db.all('SELECT * FROM disabledCommands WHERE guild = (?) AND command = (?)', [guild], (err, rows)=> {
				if (err)
					reject(err);
				resolve(rows);
			});
		});
	}
}

export class Client extends Discord.Client {
	private directory: string;

	private categories: boolean;

	private commands: Map<string, Command>;

	private commandPaths: Map<string, string>;

	private aliases: Map<string, string>;

	private Prefix: string;

	private owners: string[];

	public isOwner(id: string): boolean{
		return this.owners.includes(id);
	}

	private colors: Colors = {
		base: 0xFF8040,
		negative: 0xFF4040,
		success: 0x80FF80,
		error: 0xFF0000,
	};

	private store: sqlite3.Database;

	private reportChannel: Discord.TextChannel;

	private customCommands: boolean;

	private saveCommand(command: Command, path?: string){
		this.commands.set(command.name, command);

		this.aliases.set(command.name.toLowerCase(), command.name);
		if(path)
			this.commandPaths.set(command.name, path);

		command.aliases.forEach((alias) => this.aliases.set(alias.toLowerCase(), command.name), this);

		command.setClient(this);
	}

	private loadCommand(path: string): Command {
		delete require.cache[require.resolve(path)];
		let command = require(path);
		if(typeof(command) == 'function')
			command = new command(this.Prefix);
		else if(!(command instanceof Command))
			command =  new Command(command, this.Prefix);
		this.saveCommand(command, path);
		return command;
	}

	private reloadSingle(alias: string): boolean{
		let path = this.commandPaths.get(this.aliases.get(alias));

		if(!path)
			return false;

		this.loadCommand(path);

		return true;
	}

	private loadCommands(): void {
		this.aliases = new Map();
		this.commands = new Map();
		this.commandPaths = new Map();
		
		let helpInfo = [];
		if (this.categories) {
			fs.readdirSync(this.directory).forEach(directory=>{
				helpInfo.push({
					name: directory.toLowerCase().replace(/^./, m=>m.toUpperCase()),
					value: ''
				});

				directory = path.join(this.directory, directory);

				if (!fs.lstatSync(directory).isDirectory()) return;

				fs.readdirSync(directory).forEach(file=>{
					file = path.join(directory, file);

					if (fs.lstatSync(file).isFile() && file.endsWith('.js')){
						let command = this.loadCommand(file);
						helpInfo[helpInfo.length-1].value += `**${command.name}:** ${command.description}\n\n`;
					}
				}, this);
			}, this);
		}

		this.saveCommand(new Help(this.Prefix, this.commands, this.aliases, helpInfo));

		this.saveCommand(new Reload(this.Prefix, this.loadCommands, (alias: string)=>this.reloadSingle.call(this, alias)));
	}

	private async handle(message: Discord.Message): Promise<void> {
		let prompt = await utils.asyncDB.get(
			this.prompts,
			'SELECT id FROM prompts WHERE channel = (?) AND user = (?);',
			[message.channel.id, message.author.id]
		).catch(e=>this.reportError(e));

		if(prompt && prompt.id){
			let checkPrompt = this.promptResolutionMap.get(prompt.id);
			if(checkPrompt)
				checkPrompt(message);
		}
		const localPrefix = message.guild ? await this.prefixFor(message.guild.id) || this.Prefix : this.Prefix;
		if (message.author.bot || !message.content.startsWith(localPrefix)) return;

		const args = message.content.slice(localPrefix.length).split(/\s+/);

		const command = this.commands.get(this.aliases.get(args[0].toLowerCase()));
		
		if(this.customCommands)
			runCommandIfExists(args[0].toLowerCase(), message);

		if (!command) return;

		if(message.guild && !await command.enabledIn(message.guild.id)) return;

		if (command.guildOnly && !message.guild) {
			message.channel.send({
				embed: {
					title: 'You may not use that command here',
					description: 'Command restricted to guilds, apologies for any inconvenience.',
					color: 0xcc1020,
				},
			});
			return;
		}

		// @ts-ignore
		if (message.guild && !(message.channel.permissionsFor(message.guild.me).bitfield & 0x4000)) {
			message.channel.send('`I need embed links permissions to work, please contact server owner`')
				.catch(() => message.author.send({
					embed: {
						title: 'I need embed links and send messages permissions to work, please contact server owner or admins',
						// @ts-ignore
						description: `Error occurred in [${message.channel.name}](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/)`,
						color: this.colors.error,
						footer: {
							text: `Guild: ${message.guild.name}`,
						},
					},
				}));
			return;
		}

		if (command.permissions) {
			const lacking = [];
			command.permissions.forEach((perm) => {
				if (!message.member.hasPermission(perm)) { lacking.push(perm); }
			});
			if (lacking[0]) {
				message.channel.send('', {
					embed: {
						title: 'You lack the necessary permissions to use this command',
						color: this.colors.error,
						fields: [{
							name: 'Missing permission(s)',
							inline: false,
							value: lacking.reduce(
								(accumulator, currentValue) => `${accumulator}, ${currentValue}`,
							).toLowerCase().replace(/_/g, ' '),
						}],
					},
				});
				return;
			}
		}

		if (command.botPermissions) {
			const lacking = [];
			command.botPermissions.forEach((perm) => {
				if (!message.guild.me.hasPermission(perm)) { lacking.push(perm); }
			});
			if (lacking[0]) {
				message.channel.send('', {
					embed: {
						title: 'I lack the necessary permissions to use this command.',
						color: this.colors.error,
						fields: [{
							name: 'Missing permission(s)',
							inline: false,
							value: lacking.reduce(
								(accumulator, currentValue) => `${accumulator}, ${currentValue}`,
							).toLowerCase().replace(/_/g, ' '),
						}],
						footer: {
							text: 'Please contact the server owner or admins to use this command.',
						},
					},
				});
				return;
			}
		}

		command.run(message, args, this.colors, this.prompt.bind(this));
	}

	public async isCommand(message: Discord.Message): Promise<boolean> {
		return message.content.startsWith(await this.prefixFor(message.guild.id)||this.Prefix);
	}

	public report(info: reportInfo){
		if(this.reportChannel)
			this.reportChannel.send({
				embed: info
			});
	}

	public reportError(err: Error){
		this.report({
			title: 'An error occured',
			description: `${err.message}\n${err.stack}`
		});
	}

	public disableCommand: (guild: string, command: string) => Promise<void> = commandUtils.disableCommand;

	public enableCommand: (guild: string, command: string) => Promise<void> = commandUtils.enableCommand;

	public enabledIn: (guild: string, command: string) => Promise<boolean> = commandUtils.enabledIn;

	public allDisabledIn: (guild: string)=>Promise<any[]> = commandUtils.allDisabledIn;

	public prefixFor: (guild: string) => Promise<string> = PREFIX.get;

	public setPrefix: (guild: string, prefix: string) => Promise<void> = PREFIX.set;

	public prefix(): string{
		return this.Prefix;
	}

	private prompts: sqlite3.Database;

	private promptResolutionMap: Map<string, (message: Discord.Message)=>void>

	private addPrompt(message: Discord.Message, id: string, callback: (message: Discord.Message)=>void){
		this.promptResolutionMap.set(id, callback);
		this.prompts.run('INSERT OR REPLACE INTO prompts(user, channel, id) values((?), (?), (?))', [message.author.id, message.channel.id, id]);
	}

	private removePrompt(id: string){
		this.promptResolutionMap.delete(id);
		this.prompts.run('DELETE FROM prompts WHERE id = (?);', [id], err=>{
			if(err)
				throw err;
		});
	}

	public prompt(message: Discord.Message, search: RegExp): Promise<Discord.Message>{
		return new Promise((resolve, reject)=>{
			let id = crypto.createHash('sha256');
			id.update((+new Date).toString()+message.author.id);
			let timer = setTimeout(()=>{
				this.removePrompt.call(this, id);
				reject('No reply');
			},300000);
			this.addPrompt(message, id.digest('base64'), (message: Discord.Message)=>{
				if(Boolean(message.content.match(search))){
					this.removePrompt.call(this, id);
					resolve(message);
				}
			});
		});
	}

	constructor(options: ClientOptions) {
		super(options);
		if(!options.directory)
			throw 'No directory provided to handler';
		this.directory = options.directory;
		this.categories = options.categories || true;
		this.Prefix = options.prefix || '!';
		this.owners = options.owners || [];
		this.customCommands = options.enableCustomCommands;

		if(options.colors)
			Object.keys(options.colors)
				.forEach(
					key=>this.colors[key]=options.colors[key],
					this
				);

		this.on('ready', ()=>(()=>{
			let channel = this.channels.resolve(options.logChannel)
			//@ts-ignore
			this.reportChannel = channel && channel.type === 'text' ? channel : null;
		}).call(this));

		this.store = db;

		this.store.run('CREATE TABLE IF NOT EXISTS disabledCommands(guild TEXT NOT NULL, command TEXT NOT NULL);');
		this.store.run('CREATE TABLE IF NOT EXISTS prefixes(guild TEXT UNIQUE NOT NULL, prefix TEXT NOT NULL);');

		this.prompts = new sqlite.Database(':memory:', err=>{
			if(err)
				throw err;
		});

		this.prompts.run('CREATE TABLE IF NOT EXISTS prompts(user TEXT NOT NULL, channel TEXT NOT NULL, id TEXT NOT NULL);')

		this.promptResolutionMap = new Map;
		
		this.loadCommands();

		this.on('message', this.handle.bind(this));
	}
}

export { Command, PREFIX as Prefix };
