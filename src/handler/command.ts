import * as Discord from 'discord.js';

import { Handler } from './index';

type command = {
	name: string;
	run: (message: Discord.Message, args: string[]) => void;
	description?: string;
	detailed?: string;
	examples?: ((prefix: string) => string | string);
	aliases?: string[];
	permissions?: Discord.PermissionString[];
	botPermissions?: Discord.PermissionString[];
	guildOnly?: boolean;
	category?: string;
}

export class Command {
	name: string;
	run: (message: Discord.Message, args?: string[]) => void;
	description: string;
	detailed: string;
	examples: string;
	aliases: string[];
	permissions: Discord.PermissionString[];
	botPermissions: Discord.PermissionString[];
	guildOnly: boolean;
	category: string;
	handler: Handler;

	constructor(source: command, prefix: string = '!', category?: string) {
		if (!source.name)
			throw 'Cannot create a command without a name.';

		this.name = source.name;

		if (!source.run)
			throw 'Cannot create a command without a function to run.';

		this.run = source.run;

		this.description = source.description || 'No description provided';

		if (source.examples)
			this.examples = typeof (source.examples) === 'string' ? source.examples : source.examples(prefix);
		else
			this.examples = 'No examples available'

		this.description = source.description || 'No description available';

		this.detailed = source.detailed || 'No description available';

		this.aliases = source.aliases || [];

		this.permissions = source.permissions || [];

		this.botPermissions = source.botPermissions || [];

		this.guildOnly = source.guildOnly || false;

		this.category = source.category||category;
	}

	public setHandler(handler: Handler){
		this.handler = handler;
	}

	public async enabledIn(guild: string | Discord.Guild): Promise<boolean>{
		return await this.handler.enabledIn(this.name, typeof(guild)==='string'?guild : guild.id);
	}
}