import * as Discord from 'discord.js';

import { Client, Colors, Message } from './index';

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
	examples?: (prefix: string) => string | string;
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

	constructor(source: command | Command, prefix = '!', category?: string, client?: Client) {
		if (!source.name) throw new Error('Cannot create a command without a name.');

		this.name = source.name;

		if (!source.run) throw new Error('Cannot create a command without a function to run.');

		this.run = source.run;

		this.description = source.description || 'No description provided';

		if (source.examples)
			this.examples =
				typeof source.examples === 'string' || prefix === undefined
					? (source.examples as string)
					: source.examples(prefix);
		else this.examples = 'No examples available';

		this.description = source.description || 'No description available';

		this.detailed = source.detailed || 'No description available';

		this.aliases = source.aliases || [];

		this.permissions = source.permissions || [];

		this.botPermissions = source.botPermissions || [];

		this.guildOnly = source.guildOnly || false;

		this.category = source.category || category;

		this.client = client;
	}

	public async enabledIn(guild: string | Discord.Guild): Promise<boolean> {
		return await this.client.enabledIn(
			this.name.toLowerCase(),
			typeof guild === 'string' ? guild : guild.id
		);
	}
}
