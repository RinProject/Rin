import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from './command';
import { Help, Reload, Prefix } from './commands';
import * as sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();

type colors = {
	base?: number;
	negative?: number;
	success?: number;
	error?: number;
	[key: string]: number;
}

type handlerOptions = {
	directory: string;	// Absolute path to commands folder
	enableCustomCommands: boolean;
	owners?: string[];	//	Bot owners as an array of id strings
	prefix?: string;	//	Default prefix
	logChannel?: string;	//	Discord channel to which errors / shall be logged
	categories?: boolean;	//	wether or not to read direct child directories as categories
	colors?: colors;	//	color variables that can be used in command
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

export class Handler {
	private directory: string;

	private categories: boolean;

	private commands: Map<string, Command>;

	private commandPaths: Map<string, string>;

	private aliases: Map<string, string>;

	private Prefix: string;

	private owners: string[];

	private colors: colors = {
		base: 0xFF8040,
		negative: 0xFF4040,
		success: 0x80FF80,
		error: 0xFF0000,
	};

	private client: Discord.Client;

	private db: sqlite3.Database;

	private reportChannel: Discord.TextChannel;

	private customCommands: boolean;

	private saveCommand(command: Command, path?: string){
		this.commands.set(command.name, command);

		this.aliases.set(command.name.toLowerCase(), command.name);
		if(path)
			this.commandPaths.set(command.name, path);

		command.aliases.forEach((alias) => this.aliases.set(alias.toLowerCase(), command.name), this);

		command.setHandler(this);
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

		this.saveCommand(new Reload(this.Prefix, this.loadCommands, (alias: string)=>this.reloadSingle.call(this, alias), this.owners));
	}

	private async handle(message: Discord.Message): Promise<void> {
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

		command.run(message, args);
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

	public disableCommand(guild: string, command: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			command = this.aliases.get(command.toLowerCase());
			if(command == 'toggleCommand')
				reject(new Error('Incorrect usage'));
			this.db.run('INSERT OR REPLACE INTO FROM disabledCommands WHERE guild = (?) AND command = (?);', [guild, command], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	}

	public enableCommand(guild: string, command: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			this.db.run('DELETE FROM disabledCommands WHERE guild = (?) AND command = (?);', [guild, command], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	}

	public async enabledIn(guild: string, command: string): Promise<boolean>{
		return new Promise((resolve, reject)=>{
			command = this.aliases.get(command.toLowerCase());
			this.db.get('SELECT * FROM disabledCommands WHERE guild = (?) AND command = (?)', [guild, command], (err, row)=> {
				if (err)
					reject(err);
				resolve(!Boolean(row));
			});
		});
	}

	public async allDisabledIn(guild: string): Promise<any[]>{
		return new Promise((resolve, reject)=>{
			this.db.all('SELECT * FROM disabledCommands WHERE guild = (?) AND command = (?)', [guild], (err, rows)=> {
				if (err)
					reject(err);
				resolve(rows);
			});
		});
	}

	public async prefixFor(guild: string): Promise<string>{
		return new Promise((resolve, reject)=>{
			this.db.get('SELECT prefix FROM prefixes WHERE guild = (?)', [guild], (err, row)=> {
				if (err)
					reject(err);
				resolve(row?row.prefix:null);
			});
		});
	}

	public async setPrefix(guild: string, prefix: string): Promise<void>{
		return new Promise((resolve, reject)=>{
			this.db.run('INSERT OR REPLACE INTO prefixes(guild, prefix) VALUES((?), (?));', [guild, Prefix], (err)=> {
				if (err)
					reject(err);
				resolve();
			});
		});
	}

	public prefix(): string{
		return this.Prefix;
	}


	constructor(options: handlerOptions, client: Discord.Client) {
		if(!options.directory)
			throw 'No directory provided to handler';
		this.directory = options.directory;
		this.categories = options.categories || true;
		this.Prefix = options.prefix || '!';
		this.owners = options.owners || [];
		this.client = client;
		this.customCommands = options.enableCustomCommands;
		this.client.on('ready', ()=>(()=>{
			let channel = client.channels.resolve(options.logChannel)
			//@ts-ignore
			this.reportChannel = channel && channel.type === 'text' ? channel : null;
		}).call(this));

		this.db = db;

		this.db.run('CREATE TABLE IF NOT EXISTS disabledCommands(guild TEXT NOT NULL, command TEXT NOT NULL);');
		this.db.run('CREATE TABLE IF NOT EXISTS prefixes(guild TEXT UNIQUE NOT NULL, prefix TEXT NOT NULL);');

		this.loadCommands();

		this.client.on('message', (m)=>this.handle.call(this, m));
	}
}

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

const commandUtils = {
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

export { Command, commandUtils, PREFIX as Prefix };
