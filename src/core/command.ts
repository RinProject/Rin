import * as Discord from 'discord.js';

import { Client, Colors, Message } from './client';
import { permissionsFlags } from './utils';

export type exampleResolvable = string | ((prefix: string) => string);

export interface PromptOptions {
	channel: string;
	user: string;
	search?: RegExp | string;
}

export interface command {
	name: string;
	run?: (
		message: Message,
		args?: string[],
		colors?: Colors,
		Prompt?: (options: PromptOptions) => Promise<Message>
	) => Promise<void>;
	description?: string;
	detailed?: string;
	examples?: exampleResolvable[] | exampleResolvable;
	aliases?: string[];
	permissions?: Discord.PermissionString[];
	botPermissions?: Discord.PermissionString[];
	guildOnly?: boolean;
	category?: string;
}

export class Command {
	name: string;
	run: (
		message: Message,
		args?: string[],
		colors?: Colors,
		Prompt?: (options: PromptOptions) => Promise<Message>
	) => Promise<void>;
	description: string;
	detailed: string;
	examples: string;
	aliases: string[];
	permissions: Discord.PermissionString[];
	botPermissions: Discord.PermissionString[];
	guildOnly: boolean;
	category: string;
	client: Client;
	help: string;

	constructor(source: command | Command, prefix = '${prefix}', category?: string, client?: Client) {
		if (!source.name) throw new Error('Cannot create a command without a name.');

		this.name = source.name;

		if (!source.run) throw new Error('Cannot create a command without a function to run.');

		this.run = source.run;

		this.description = source.description || 'No description provided';

		if (Array.isArray(source.examples) && prefix)
			this.examples = (source.examples.reduce(
				(acc, example) =>
					acc +
					(typeof example === 'function'
						? example(prefix)
						: example.replace(/\${prefix}/gi, prefix)) +
					'\n',
				''
			) as string).replace(/\n+$/, '');
		else if (source.examples && prefix)
			this.examples =
				typeof source.examples === 'function'
					? source.examples(prefix)
					: (source.examples as string).replace(/\${prefix}/gi, prefix);
		else this.examples = `${prefix}${this.name}`;

		this.description = source.description || 'No description available';

		this.detailed = source.detailed || 'No description available.';

		this.aliases = source.aliases || [];

		if (source.permissions && Array.isArray(source.permissions) && source.permissions[0]) {
			for (const permission of source.permissions)
				if (permissionsFlags[permission.toLowerCase()] === undefined)
					throw new Error(`'${permission}' is not a valid permission.`);
			this.permissions = source.permissions;
		} else {
			this.permissions = [];
		}

		if (source.botPermissions && Array.isArray(source.botPermissions) && source.botPermissions[0]) {
			for (const permission of source.botPermissions)
				if (permissionsFlags[permission.toLowerCase()] === undefined)
					throw new Error(`'${permission}' is not a valid permission.`);
			this.botPermissions = source.botPermissions;
		} else {
			this.botPermissions = [];
		}

		this.guildOnly = source.guildOnly || false;

		this.category = source.category || category || '';

		this.client = client;

		this.help = `${this.category ? `Category: ${this.category}\n` : ''}Description:\n${
			this.detailed
		}\nExample(s):\n\`\`\`${this.examples}\n\`\`\`\n${
			this.aliases && this.aliases.length
				? `Aliases:\n\`\`\`md\n${this.aliases.reduce(
						(acc, alias) => `${acc}\n• ${alias}`,
						''
				  )}\n\`\`\``
				: ''
		}${
			this.permissions && this.permissions.length
				? `Permissions:\n\`\`\`md\n${this.permissions
						.map((permission) =>
							permission
								.toLowerCase()
								.replace('_', ' ')
								.replace(/(^| )\w/g, (match) => match.toUpperCase())
						)
						.reduce((acc, command) => `${acc}\n• ${command}`, '')}\n\`\`\``
				: ''
		}`;
	}

	public async enabledIn(guild: string | Discord.Guild): Promise<boolean> {
		return await this.client.enabledIn(
			this.name.toLowerCase(),
			typeof guild === 'string' ? guild : guild.id
		);
	}
}
