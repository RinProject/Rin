import { customCommandHandler } from './customCommands';
import { mute, unmute, getMute, start } from './mute';

import * as Discord from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command, PromptOptions } from './command';
import { Help, Reload, Prefix, CustomCommand } from './systemCommands';
import { IMuteSchema } from '../database.schema';
import { Guild } from '../database';

export type Colors = {
	base?: number;
	negative?: number;
	success?: number;
	error?: number;
	[key: string]: number;
};

export interface ClientOptions extends Discord.ClientOptions {
	directory: string; // Absolute path to commands folder
	enableCustomCommands: boolean;
	owners?: string[]; // Bot owners as an array of id strings
	prefix?: string; //	Default prefix
	logChannel?: string; //	Discord channel to which errors / shall be logged
	categories?: boolean; // wether or not to read direct child directories as categories
	colors?: Colors; //	color variables that can be used in command
}

export type reportInfo = {
	title?: string;
	description?: string;
	color?: number;
	mention?: boolean;
};

const category = /^[^\\/]*([\\/][^\\/]+)*[\\/](?=[^\\/]+[\\/][^\\/]+$)/;
const fileEnd = /[\\/][^\\/]+$/;

export interface ClientEvents extends Discord.ClientEvents {
	mute: [
		Discord.Guild,
		Discord.GuildMember,
		number,
		string,
		Discord.GuildMember,
		Discord.TextChannel
	];

	unmute: [Discord.Guild, Discord.GuildMember];

	warning: [
		Discord.Guild,
		Discord.GuildMember,
		number,
		string,
		Discord.GuildMember,
		Discord.TextChannel
	];
}

export interface Message extends Discord.Message {
	client: Client;
}

export class Client extends Discord.Client {
	private directory: string;

	private categories: boolean;

	private commands: Map<string, Command>;

	private commandPaths: Map<string, string>;

	private aliases: Map<string, string>;

	private Prefix: string;

	private owners: string[];

	public isOwner(id: string): boolean {
		return this.owners.includes(id);
	}

	public colors: Colors = {
		base: 0xff8040,
		negative: 0xff4040,
		success: 0x80ff80,
		error: 0xff0000,
	};

	private reportChannel: Discord.TextChannel;

	private customCommands: boolean;

	private saveCommand(command: Command, path?: string) {
		this.commands.set(command.name, command);

		this.aliases.set(command.name.toLowerCase(), command.name);
		if (path) this.commandPaths.set(command.name, path);

		command.aliases.forEach((alias) => this.aliases.set(alias.toLowerCase(), command.name), this);
	}
	private loadCommand(path: string): Command {
		delete require.cache[require.resolve(path)];
		let command = require(path);
		if (typeof command == 'function') command = new command(this.Prefix);
		else
			command = new Command(
				command,
				this.Prefix,
				path.replace(category, '').replace(fileEnd, ''),
				this
			);
		this.saveCommand(command, path);
		return command;
	}

	private reloadSingle(alias: string): boolean {
		const path = this.commandPaths.get(this.aliases.get(alias));

		if (!path) return false;

		this.loadCommand(path);

		return true;
	}

	private loadCommands(): void {
		this.aliases = new Map();
		this.commands = new Map();
		this.commandPaths = new Map();

		const helpInfo = [];
		if (this.categories) {
			fs.readdirSync(this.directory).forEach((directory) => {
				helpInfo.push({
					name: directory.toLowerCase().replace(/^./, (m) => m.toUpperCase()),
					value: '',
				});

				directory = path.join(this.directory, directory);

				if (!fs.lstatSync(directory).isDirectory()) return;

				fs.readdirSync(directory).forEach((file) => {
					file = path.join(directory, file);

					if (fs.lstatSync(file).isFile() && file.endsWith('.js')) {
						const command = this.loadCommand(file);
						helpInfo[
							helpInfo.length - 1
						].value += `**${command.name}:** ${command.description}\n\n`;
					}
				}, this);
			}, this);
		}

		this.saveCommand(new Help(this.Prefix, this.commands, this.aliases, helpInfo, this));

		this.saveCommand(
			new Reload(
				this.Prefix,
				this.loadCommands,
				(alias: string) => this.reloadSingle.call(this, alias),
				this
			)
		);

		this.saveCommand(new Command(Prefix, this.Prefix, 'System', this));

		this.saveCommand(new Command(CustomCommand, this.Prefix, 'System', this));
	}

	private async handleCustomCommands(message: Message) {
		if (!message.guild) return;
		const prefix = await this.prefixFor(message.guild.id);
		if (message.guild && message.content.startsWith(prefix)) {
			customCommandHandler(
				message.content.slice(prefix.length).split(/\s+/, 1)[0].toLowerCase(),
				message
			);
		}
	}

	private async commandHandler(message: Message): Promise<void> {
		const prompt = this.prompts.get(message.author.id + message.channel.id);

		if (prompt) {
			prompt(message);
			return;
		}

		const localPrefix = message.guild ? await this.prefixFor(message.guild.id) : this.Prefix;
		if (message.author.bot || !message.content.startsWith(localPrefix)) return;

		const args = message.content.slice(localPrefix.length).split(/\s+/);

		const command = this.commands.get(this.aliases.get(args[0].toLowerCase()));

		if (!command) return;

		if (message.guild && !(await command.enabledIn(message.guild.id))) return;

		if (command.guildOnly && !message.guild) {
			message.channel.send({
				embed: {
					title: 'You may not use that command here',
					description: 'Command restricted to guilds, apologies for any inconvenience.',
					color: this.colors.error,
				},
			});
			return;
		}

		if (
			message.guild &&
			!((message.channel as Discord.TextChannel).permissionsFor(message.guild.me).bitfield & 0x4000)
		) {
			message.channel
				.send('`I need embed links permissions to work, please contact server owner`')
				.catch(() =>
					message.author.send({
						embed: {
							title:
								'I need embed links and send messages permissions to work, please contact server owner or admins',
							description: `Error occurred in [${
								(message.channel as Discord.TextChannel).name
							}](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/)`,
							color: this.colors.error,
							footer: {
								text: `Guild: ${message.guild.name}`,
							},
						},
					})
				);
			return;
		}

		if (command.permissions) {
			const lacking = [];
			command.permissions.forEach((perm) => {
				if (!message.member.hasPermission(perm)) {
					lacking.push(perm);
				}
			});
			if (lacking[0]) {
				message.channel.send('', {
					embed: {
						title: 'You lack the necessary permissions to use this command',
						color: this.colors.error,
						fields: [
							{
								name: 'Missing permission(s)',
								inline: false,
								value: lacking
									.reduce((accumulator, currentValue) => `${accumulator}, ${currentValue}`)
									.toLowerCase()
									.replace(/_/g, ' '),
							},
						],
					},
				});
				return;
			}
		}

		if (command.botPermissions) {
			const lacking = [];
			command.botPermissions.forEach((perm) => {
				if (!message.guild.me.hasPermission(perm)) {
					lacking.push(perm);
				}
			});
			if (lacking[0]) {
				message.channel.send('', {
					embed: {
						title: 'I lack the necessary permissions to use this command.',
						color: this.colors.error,
						fields: [
							{
								name: 'Missing permission(s)',
								inline: false,
								value: lacking
									.reduce((accumulator, currentValue) => `${accumulator}, ${currentValue}`)
									.toLowerCase()
									.replace(/_/g, ' '),
							},
						],
						footer: {
							text: 'Please contact the server owner or admins to use this command.',
						},
					},
				});
				return;
			}
		}

		command.run(message, args, this.colors, this.prompt.bind(this)).catch((e) => {
			message.channel.send(
				"`You shouldn't see this, an error has occurred and any output is likely corrupted, developers have been informed.`"
			);
			this.reportError(e);
		});
	}

	public isCommand = async (message: Message): Promise<boolean> =>
		message.content.startsWith((await this.prefixFor(message.guild.id)) || this.Prefix);

	public report(info: reportInfo): void {
		if (this.reportChannel)
			this.reportChannel.send({
				embed: info,
			});
	}

	public reportError(err: Error): void {
		this.report({
			title: 'An error occurred',
			description: `${err.message}\n${err.stack}`,
		});
	}

	private aliasToCommand(alias: string): string {
		const command = this.aliases.get(alias.toLowerCase());
		if (!command) throw new Error('Invalid command.');
		return command;
	}

	public async disableCommand(guild: string, commandAlias: string): Promise<void> {
		const command = this.aliasToCommand(commandAlias);
		const g = await Guild.findOne({ id: guild });
		if (g.disabledCommands.includes(command)) return;
		g.disabledCommands.push(command);
		g.update({ disabledCommands: g.disabledCommands });
		g.save();
	}

	public async enableCommand(guild: string, commandAlias: string): Promise<void> {
		const command = this.aliasToCommand(commandAlias);
		const g = await Guild.findOne({ id: guild });
		const index = g.disabledCommands.indexOf(command);
		if (index === -1) return;
		else {
			g.disabledCommands.splice(index, 1);
			g.update({ disabledCommands: g.disabledCommands });
			g.save();
		}
	}

	public async enabledIn(guild: string, command: string): Promise<boolean> {
		command = this.aliases.get(command.toLowerCase());
		const g = await Guild.findOne({ id: guild });
		return !(g && g.disabledCommands && g.disabledCommands.includes(command));
	}

	public async allDisabledIn(guild: string): Promise<string[]> {
		return (await Guild.findOne({ id: guild })).disabledCommands || [];
	}

	public async prefixFor(guild: string): Promise<string> {
		return new Promise((resolve, reject) => {
			Guild.findOne({ id: guild })
				.then((g) => resolve(g.prefix || this.Prefix))
				.catch(reject);
		});
	}

	public async setPrefix(guild: string, prefix: string): Promise<void> {
		const g = await Guild.findOne({ id: guild });
		g.update({ prefix: prefix.toLowerCase() });
		g.save();
	}

	public prefix(): string {
		return this.Prefix;
	}

	public mute: (
		guild: Discord.Guild,
		member: Discord.GuildMember,
		time: number,
		reason: string,
		moderator: Discord.GuildMember,
		channel?: Discord.TextChannel
	) => Promise<void> = mute;

	public unmute: (guild: Discord.Guild, member: Discord.GuildMember) => Promise<void> = unmute;

	public getMute: (
		guild: Discord.GuildResolvable,
		member: Discord.GuildMemberResolvable
	) => Promise<IMuteSchema> = getMute;

	private prompts: Map<string, (message: Message) => void>;

	private addPrompt(id: string, callback: (message: Message) => void) {
		this.prompts.set(id, callback);
	}

	private removePrompt(id: string) {
		this.prompts.delete(id);
	}

	public prompt({ user, channel, search }: PromptOptions): Promise<Message> {
		return new Promise((resolve, reject) => {
			const id = user + channel;
			const timer = setTimeout(() => {
				this.removePrompt.call(this, id);
				reject('No reply');
			}, 300000);
			this.addPrompt(id, (message: Message) => {
				if (message.content.match(search)) {
					this.removePrompt.call(this, id);
					clearTimeout(timer);
					resolve(message);
				}
			});
		});
	}

	public on<K extends keyof ClientEvents>(
		event: K,
		listener: (...args: ClientEvents[K]) => void
	): this {
		//	@ts-ignore
		super.on(event, listener);
		return this;
	}

	public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean {
		//	@ts-ignore
		return super.emit(event, ...args);
	}

	constructor(options: ClientOptions) {
		super(options);
		if (!options.directory) throw new Error('No directory provided to handler');
		this.directory = options.directory;
		this.categories = options.categories !== undefined ? options.categories : true;
		this.Prefix = options.prefix || '!';
		this.owners = options.owners || [];
		this.customCommands = Boolean(options.enableCustomCommands);

		if (options.colors)
			Object.keys(options.colors).forEach((key) => (this.colors[key] = options.colors[key]), this);

		this.on('ready', () =>
			(() => {
				const channel = this.channels.resolve(options.logChannel) as Discord.TextChannel;
				if (!channel) console.warn('No log channel provided.');
				this.reportChannel = channel && channel.type === 'text' ? channel : null;
				start(this);
			}).call(this)
		);

		this.prompts = new Map();

		this.loadCommands();

		this.on(
			'message',
			!this.customCommands
				? this.commandHandler.bind(this)
				: (m) => {
						this.commandHandler.call(this, m);
						this.handleCustomCommands.call(this, m);
				  }
		);

		this.on('guildMemberAdd', async (member) => {
			if (member.partial) await member.fetch();

			const mute = await this.getMute(member.guild, member as Discord.GuildMember);

			if (!(mute && mute.member)) return;

			const g = await Guild.findOne({ id: member.guild.id }).exec();

			const role = member.guild.roles.resolve(g.muteRole);

			member.roles.add(role).catch(() => {});
		});
	}
}
