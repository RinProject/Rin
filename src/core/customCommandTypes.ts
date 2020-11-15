import * as Discord from 'discord.js';

export type action = 'mute' | 'giveRole' | 'addRole' | 'removeRole' | 'toggleRole';

export interface Action {
	action: action;
	target: string;
	option: string;
}

export interface Footer {
	text?: string;
	iconURL?: string;
}

export interface FieldDataResolvable extends Discord.EmbedFieldData {
	title?: string;
	description?: string;
	short?: boolean;
}

export type Image = { url?: string };

export interface Embed {
	message?: string;
	author?: Discord.MessageEmbedAuthor;
	thumbnail?: Image;
	title?: string;
	color?: number;
	description?: string;
	fields?: Discord.EmbedFieldData[];
	image?: Image;
	footer?: Footer;
	actions?: Action[];
}

export interface CustomCommand {
	name: string;
	permissions: Discord.PermissionResolvable[];
	requires: {
		mentions: number;
	};
	embed: Embed;
	insufficientMentions: Embed;
	insufficientPermissions: Embed;
}

export interface EmbedResolvable {
	message?: string;
	author?: Discord.MessageEmbedAuthor | string;
	author_url?: string;
	author_icon?: string;
	thumbnail?: Image;
	title?: string;
	message_title?: string;
	color?: string | number;
	colour?: string | number;
	description?: string;
	fields?: FieldDataResolvable[];
	image?: Image;
	footer?: Footer | string;
	footer_icon?: string;
	actions?: Action[];
}

export interface CustomCommandResolvable {
	name: string;
	image: string;
	permissions: string[];
	requires: {
		mentions: number;
	};
	embed: EmbedResolvable;
	insufficientMentions: EmbedResolvable;
	insufficientPermissions: EmbedResolvable;
}
