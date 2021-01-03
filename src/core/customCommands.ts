import * as Discord from 'discord.js';
import { Guild } from '../database';

import {
	CustomCommand,
	CustomCommandResolvable,
	action,
	Embed,
	EmbedResolvable,
} from './customCommandTypes';

const colors = {
	error: 0xff0000,
};

const resolutions = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
function replacer(snippet: string, member: Discord.GuildMember) {
	if (!member) return undefined;
	return (() => {
		switch (snippet) {
			case 'id':
				return member.id;
			case 'nickname':
				return member.displayName;
			case 'tag':
				return member.user.tag;
			case 'username':
				return member.user.username;
			default:
				if (snippet && snippet.startsWith('pfp')) {
					let num = parseInt(snippet.replace(/\D/g, '')) || 128;
					num = resolutions.includes(num) ? num : 128;
					return member.user.displayAvatarURL({
						format: 'png',
						dynamic: true,
						//	@ts-ignore
						size: num,
					});
				}
				return member.toString();
		}
	})().replace(/"/g, '\\"');
}

function fillEmbed(embed: Embed, message: Discord.Message): Embed {
	if (embed.message) embed.message = fillField(embed.message, message);

	if (embed.author) {
		if (embed.author.name) embed.author.name = fillField(embed.author.iconURL, message);
		if (embed.author.url) embed.author.url = fillField(embed.author.url, message);
		if (embed.author.iconURL) embed.author.iconURL = fillField(embed.author.iconURL, message);
	}

	if (embed.title) embed.message = fillField(embed.title, message);

	if (embed.thumbnail && embed.thumbnail.url)
		embed.thumbnail.url = fillField(embed.thumbnail.url, message);

	if (embed.image && embed.image.url) embed.image.url = fillField(embed.image.url, message);

	if (embed.description) embed.description = fillField(embed.description, message);

	if (embed.footer) {
		if (embed.footer.text) embed.footer.text = fillField(embed.footer.text, message);
		if (embed.footer.iconURL) embed.footer.iconURL = fillField(embed.footer.iconURL, message);
	}

	return embed;
}

const pattern = /\((mentions?|author)\.?(nth\(\d+\)|first|last|all)?\.?(id|mention|nickname|tag|username|pfp\(\d{0,4}\))?\)/gi;

const splitPattern = /\w+(\(\d*\))?/g;

function fillField(field: string, message: Discord.Message): string {
	return field.replace(pattern, (match) => {
		const arr = match.toLowerCase().match(splitPattern);
		if (arr[0] == 'author') return replacer(arr[arr.length - 1], message.member);
		switch (arr[1]) {
			case 'all':
				return message.mentions.members
					.reduce((acc, curr) => acc + replacer(arr[arr.length - 1], curr) + ', ', '')
					.replace(/, $/, '');
			case 'first':
				return replacer(arr[arr.length - 1], message.mentions.members.first());
			case 'last':
				return replacer(arr[arr.length - 1], message.mentions.members.last());
			default:
				if (arr[1].startsWith('nth') || arr.length > 2) {
					return replacer(
						arr[arr.length - 1],
						message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, '')) - 1] ||
							message.mentions.members.last()
					);
				} else return replacer(arr[arr.length - 1], message.mentions.members.first());
		}
	});
}

import { mute } from './mute';
import { convertTime } from './utils';

function takeAction(
	message: Discord.Message,
	member: Discord.GuildMember,
	action: action,
	option: string
): void {
	let time: number;
	switch (action) {
		case 'mute':
			time = convertTime(option);
			if (isNaN(time)) time = undefined;
			mute(
				message.guild,
				member,
				time,
				'Custom command test',
				message.member,
				message.channel
			).catch((e) =>
				message.channel.send({
					embed: {
						title: 'Unable to mute user',
						description: e.message || e,
						color: colors.error,
					},
				})
			);
			break;

		case 'toggleRole':
			if (member.roles.cache.get(option)) {
				takeAction(message, member, 'removeRole', option);
			}
			break;
		case 'addRole':
			member.roles.add(option).catch(() =>
				message.channel.send({
					embed: {
						title: 'Unable to remove role',
						description: 'Check bot permissions and hierarchical position.',
						color: colors.error,
					},
				})
			);
			break;
		case 'removeRole':
			member.roles.remove(option).catch(() =>
				message.channel.send({
					embed: {
						title: 'Unable to remove role',
						description: 'Check bot permissions and hierarchical position.',
						color: colors.error,
					},
				})
			);
			break;
	}
}

const errorEmbed = {
	embed: {
		title: 'Custom command returned empty',
		description: `Please see [custom command documentation](${require('../../package.json')
			.repository.url.replace('git+', '')
			.replace('.git', '')}/blob/master/docs/custom_commands.md) or refer server admins there.`,
	},
};

function runCustomCommand(embed: Embed, message: Discord.Message) {
	embed = fillEmbed(embed, message);

	if (embed.actions) {
		if (Array.isArray(embed.actions) && embed.actions[0])
			embed.actions.forEach((action) => {
				if (!(action.target || action.action || action.option)) return;
				const arr = action.target.split('.');
				if (arr[0] == 'author') takeAction(message, message.member, action.action, action.option);
				else
					switch (arr[1]) {
						case 'all':
							message.mentions.members.each((member) =>
								takeAction(message, member, action.action, action.option)
							);
							break;
						case 'first':
							takeAction(message, message.mentions.members.first(), action.action, action.option);
							break;
						case 'last':
							takeAction(message, message.mentions.members.last(), action.action, action.option);
							break;
						default:
							if (arr[1].startsWith('nth'))
								takeAction(
									message,
									message.mentions.members.array()[parseInt(arr[1].replace(/\D/g, '')) - 1] ||
										message.mentions.members.last(),
									action.action,
									action.option
								);
							else
								takeAction(message, message.mentions.members.first(), action.action, action.option);
					}
			});
	}
	const msg: Discord.MessageOptions = {};
	if (Object.keys(embed).length) msg.embed = embed;
	if (msg.embed) message.channel.send(msg);
	else message.channel.send(errorEmbed);
}

export function processEmbed(input: EmbedResolvable): Embed {
	if (!input) return {};
	const embed: Embed = {
		author: {},
		footer: {},
		thumbnail: {},
		image: {},
		fields: [],
	};

	if (input.author && typeof input.author == 'string') embed.author.name = input.author;
	else if (input.author && typeof input.author == 'object') {
		if (input.author.name && typeof input.author.name == 'string')
			embed.author.name = input.author.name;

		if (input.author.url && typeof input.author.url == 'string')
			embed.author.url = input.author.url;

		if (input.author.iconURL && typeof input.author.iconURL == 'string')
			embed.author.iconURL = input.author.iconURL;
	}
	if (input.author_url && typeof input.author_url == 'string') embed.author.url = input.author_url;

	if (input.author_icon && typeof input.author_icon == 'string')
		embed.author.iconURL = input.author_icon;

	if (input.title && typeof input.title == 'string') embed.title = input.title;
	else if (input.message_title && typeof input.message_title == 'string')
		embed.title = input.message_title;

	if (input.description && typeof input.description == 'string')
		embed.description = input.description;

	if (input.color !== undefined)
		if (typeof input.color === 'string') embed.color = parseInt(input.color.replace('#', ''), 16);
		else if (typeof input.color === 'number') embed.color = input.color;

	if (input.colour !== undefined)
		if (typeof input.colour === 'string')
			embed.color = parseInt(input.colour.replace('#', ''), 16) || undefined;
		else if (typeof input.colour === 'number') embed.color = input.colour;

	if (input.thumbnail && typeof input.thumbnail == 'string') embed.thumbnail.url = input.thumbnail;
	else if (
		input.thumbnail &&
		typeof input.thumbnail == 'object' &&
		input.thumbnail.url &&
		typeof input.thumbnail.url == 'string'
	)
		embed.thumbnail.url = input.thumbnail.url;

	if (input.image && typeof input.image == 'string') embed.image.url = input.image;
	else if (
		input.image &&
		typeof input.image == 'object' &&
		input.image.url &&
		typeof input.image.url == 'string'
	)
		embed.image.url = input.image.url;

	if (input.footer && typeof input.footer == 'string') embed.footer.text = input.footer;
	else if (input.footer && typeof input.footer == 'object') {
		if (input.footer.text && typeof input.footer.text == 'string')
			embed.footer.text = input.footer.text;

		if (input.footer.iconURL && typeof input.footer.iconURL == 'string')
			embed.footer.iconURL = input.footer.iconURL;
	}

	if (input.footer_icon && typeof input.footer_icon == 'string')
		embed.footer.iconURL = input.footer_icon;

	if (input.fields && Array.isArray(input.fields)) {
		const len = Math.min(input.fields.length, 25);
		for (let i = 0; i < len; i++) {
			const field = input.fields[i];
			if (
				field &&
				typeof field == 'object' &&
				(field.name || field.title || field.description || field.value)
			)
				embed.fields.push({
					name: field.name || field.title || '',
					value: field.description || field.value || '',
					inline: field.short || field.inline || false,
				});
		}
	}

	if (input.actions && Array.isArray(input.actions))
		embed.actions = input.actions.filter(
			(action) => action.action && action.option && action.target
		);

	if (!Object.keys(embed.author).length) delete embed.author;
	if (!Object.keys(embed.footer).length) delete embed.footer;
	if (!Object.keys(embed.thumbnail).length) delete embed.thumbnail;
	if (!Object.keys(embed.image).length) delete embed.image;
	if (!Object.keys(embed.fields).length) delete embed.fields;
	return embed;
}

import { permissionsFlags } from './utils';

export async function customCommandHandler(
	command: string,
	message: Discord.Message
): Promise<void> {
	if (message.author.bot) return;
	const g = await Guild.findOne({ id: message.guild.id });
	if (!(g && g.customCommands)) return;
	const customCommand = g.customCommands.get(command);
	if (!(customCommand && customCommand.name)) return;
	if (customCommand.permissions) {
		if (customCommand.permissions) {
			const lacking = [];
			customCommand.permissions.forEach((permission) => {
				if (!message.member.hasPermission(permission)) lacking.push(permission);
			});
			if (lacking[0]) {
				if (customCommand.insufficientPermissions)
					runCustomCommand(customCommand.insufficientPermissions, message);
				else
					message.channel.send('', {
						embed: {
							title: 'You lack the necessary permissions to use this command',
							color: colors.error,
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
	}
	if (customCommand.requires) {
		const mentions = (customCommand.requires || {}).mentions || 0;
		if (message.mentions.members.array().length < mentions) {
			if (customCommand.insufficientMentions)
				runCustomCommand(customCommand.insufficientMentions, message);
			else
				message.channel.send('', {
					embed: {
						title: 'Too few mentions',
						color: colors.error,
					},
				});
			return;
		}
	}
	runCustomCommand(customCommand.embed, message);
}

export async function fetchCommands(guild: string): Promise<Map<string, CustomCommand>> {
	const g = await Guild.findOne({ id: guild });
	return g.customCommands;
}

export async function fetchCommandList(guild: string): Promise<CustomCommand[]> {
	const g = await Guild.findOne({ id: guild });
	return Array.from(g.customCommands, (custom) => custom[1]);
}

export async function fetchCommand(guild: string, command: string): Promise<CustomCommand> {
	const g = await Guild.findOne({ id: guild });
	return g.customCommands.get(command);
}

const validEmbed = (embed: Embed) =>
	embed.title ||
	embed.description ||
	(embed.fields && embed.fields[0]) ||
	(embed.thumbnail && embed.thumbnail.url) ||
	(embed.image && embed.image.url) ||
	(embed.image && typeof embed.image == 'string');

export async function createCommand(commandString: string, guild: string): Promise<CustomCommand> {
	const command: CustomCommandResolvable = JSON.parse(commandString);
	if (!command) throw new Error('Incomplete command');
	const embed = processEmbed(command.embed);
	if (!validEmbed(embed)) throw new Error('Incomplete command');

	if (!command.name) throw new Error('Incomplete command');

	let insufficientPermissions = processEmbed(command.insufficientPermissions);
	if (!validEmbed(insufficientPermissions)) insufficientPermissions = undefined;

	let insufficientMentions = processEmbed(command.insufficientMentions);
	if (!validEmbed(insufficientMentions)) insufficientMentions = undefined;

	command.permissions =
		Array.isArray(command.permissions) && command.permissions[0] ? command.permissions : undefined;

	let permissions: Discord.PermissionResolvable[];
	if (command.permissions) {
		command.permissions = command.permissions.filter(
			(permission) =>
				typeof permission === 'string' && permissionsFlags[permission.toLowerCase()] != undefined
		);
		permissions = command.permissions.map(
			(permission) => permissionsFlags[permission.toLowerCase()]
		);
	}
	const customCommand: CustomCommand = {
		name: command.name.toLowerCase(),
		permissions,
		requires: {
			mentions:
				command.requires && command.requires.mentions
					? Number(command.requires.mentions) || undefined
					: undefined,
		},
		embed,
		insufficientPermissions,
		insufficientMentions,
	};

	const g = await Guild.findOne({ id: guild });
	g.customCommands.set(customCommand.name, customCommand);
	g.save();
	return customCommand;
}

export async function deleteCommand(guild: string, command: string): Promise<void> {
	const g = await Guild.findOne({ id: guild });
	g.customCommands.delete(command.toLowerCase());
	g.save();
}
