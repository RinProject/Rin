import mongoose from 'mongoose';

import { eventFlags } from './core/utils';
import { CustomCommand } from './core/customCommandTypes';

export type LogEvent =
	| 'channelCreate'
	| 'channelDelete'
	| 'channelUpdate'
	| 'ban'
	| 'unban'
	| 'join'
	| 'leave'
	| 'messageDelete'
	| 'messageDeleteBulk'
	| 'messageEdit'
	| 'mute'
	| 'unmute'
	| 'warning';

export const GuildSchema = new mongoose.Schema({
	id: {
		required: true,
		type: String,
		index: true,
	},
	disabledCommands: {
		default: {},
		type: Map,
		of: Object,
	},
	customCommands: {
		default: {},
		type: Map,
		of: Object,
	},
	reactionRoles: {
		default: {},
		type: Map,
		of: String,
	},
	warnings: {
		type: Array,
		default: [],
	},
	prefix: { type: String },
	muteRole: { type: String },
	logChannel: { type: String },
	eventsLogged: { type: Number, default: 0 },
});

GuildSchema.methods.eventLogged = function (event: LogEvent): boolean {
	return Boolean(this.eventsLogged & (eventFlags[event.toLowerCase()] || 0x0));
};

GuildSchema.methods.enableLoggingFor = function (event: LogEvent): void {
	this.eventsLogged |= eventFlags[event.toLowerCase()] || 0x0;
};

GuildSchema.methods.disableLoggingFor = function (event: LogEvent): void {
	if (eventFlags[event] !== undefined) this.eventsLogged &= ~eventFlags[event];
};

const allEvents = Object.keys(eventFlags).reduce((acc, v) => acc | eventFlags[v], 0);

GuildSchema.methods.logAll = function () {
	this.eventsLogged = allEvents;
};

GuildSchema.methods.logNone = function () {
	this.eventsLogged = 0;
};

GuildSchema.methods.enableCommand = function (command: string, channel?: string) {
	const status = (this as IGuildSchema).disabledCommands.get(command);
	if (status === undefined) return;
	if (channel === undefined) {
		if (!status.guild) {
			(this as IGuildSchema).disabledCommands.delete(command);
			(this as IGuildSchema).markModified('disabledCommands');
		}
	} else {
		if (status.guild) {
			throw new Error('Command disabled globally, unable to disable in this channel.');
		} else {
			const i = status.channels.indexOf(channel);
			if (i < 0) return;
			status.channels.splice(i, 1);
			(this as IGuildSchema).disabledCommands.set(command, status);
			(this as IGuildSchema).markModified('disabledCommands');
		}
	}
};

GuildSchema.methods.disableCommand = function (command: string, channel?: string) {
	if (channel === undefined) {
		(this as IGuildSchema).disabledCommands.set(command, { guild: true, channels: [] });
		(this as IGuildSchema).markModified('disabledCommands');
	} else {
		const status = (this as IGuildSchema).disabledCommands.get(command);
		if (status === undefined) {
			(this as IGuildSchema).disabledCommands.set(command, {
				guild: false,
				channels: [channel],
			});
			(this as IGuildSchema).markModified('disabledCommands');
		} else if (!status.guild) {
			status.channels.push(channel);
			(this as IGuildSchema).disabledCommands.set(command, status);
			(this as IGuildSchema).markModified('disabledCommands');
		}
	}
};

GuildSchema.methods.enabledIn = function (command: string, channel?: string) {
	const status = (this as IGuildSchema).disabledCommands.get(command);
	return !(status && (status.guild || (channel && status.channels.includes(channel))));
};

export interface IWarnSchema {
	id: string;
	user: string;
	moderator: string;
	reason: string;
	timestamp: number;
	active: boolean;
}

export interface IDisabledCommand {
	guild: boolean;
	channels: string[];
}
export interface IGuildSchema extends mongoose.Document {
	id: string;
	disabledCommands: Map<string, IDisabledCommand>;
	customCommands: Map<string, CustomCommand>;
	reactionRoles: Map<string, string>; // Maps message id + emoji id to role id
	warnings: IWarnSchema[];
	prefix: string;
	muteRole: string;
	logChannel: string;
	eventsLogged: number;
	eventLogged(event: LogEvent): boolean;
	enableLoggingFor(event: LogEvent): void;
	disableLoggingFor(event: LogEvent): void;
	disableCommand(command: string, channel?: string): void;
	enableCommand(command: string, channel?: string): void;
	enabledIn(command: string, channel?: string): boolean;
	logAll(): void;
	logNone(): void;
}

export const MuteSchema = new mongoose.Schema({
	guild: {
		required: true,
		type: String,
	},
	member: {
		required: true,
		type: String,
	},
	ends: {
		required: true,
		type: Number,
	},
	reason: {
		required: true,
		type: String,
	},
	moderator: {
		required: true,
		type: String,
	},
});

export interface IMuteSchema extends mongoose.Document {
	guild: string;
	member: string;
	ends: number;
	reason: string;
	moderator: string;
}

/**
 * Valid schemas for use in the database.
 */
export enum ValidSchemas {
	IMuteSchema,
	IGuildSchema,
}
