import * as Discord from 'discord.js';

import { Client, Colors } from './index';

export type command = {
	name: string;
	run: (
		message: Discord.Message,
		args?: string[],
		colors?: Colors,
		Prompt?: (message: Discord.Message, search: RegExp) => Promise<Discord.Message>
	) => Promise<void>;
	description?: string;
	detailed?: string;
	examples?: (prefix: string) => string | string;
	aliases?: string[];
	permissions?: Discord.PermissionString[];
	botPermissions?: Discord.PermissionString[];
	guildOnly?: boolean;
	category?: string;
};

export class Command {
	name: string;
	run: (
		message: Discord.Message,
		args?: string[],
		colors?: Colors,
		Prompt?: (message: Discord.Message, search: RegExp) => Promise<Discord.Message>
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

	constructor(source: command, prefix = '!', category?: string) {
		if (!source.name) throw new Error('Cannot create a command without a name.');

		this.name = source.name;

		if (!source.run) throw new Error('Cannot create a command without a function to run.');

		this.run = source.run;

		this.description = source.description || 'No description provided';

		if (source.examples)
			this.examples =
				typeof source.examples === 'string' ? source.examples : source.examples(prefix);
		else this.examples = 'No examples available';

		this.description = source.description || 'No description available';

		this.detailed = source.detailed || 'No description available';

		this.aliases = source.aliases || [];

		this.permissions = source.permissions || [];

		this.botPermissions = source.botPermissions || [];

		this.guildOnly = source.guildOnly || false;

		this.category = source.category || category;
	}

	public setClient(client: Client): void {
		this.client = client;
	}

	public async enabledIn(guild: string | Discord.Guild): Promise<boolean> {
		return await this.client.enabledIn(this.name, typeof guild === 'string' ? guild : guild.id);
	}
}
