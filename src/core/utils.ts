import * as Discord from 'discord.js';

export const permissionsFlags = {
	create_instant_invite: 0x00000001,
	kick_members: 0x00000002,
	ban_members: 0x00000004,
	administrator: 0x00000008,
	manage_channels: 0x00000010,
	manage_guild: 0x00000020,
	add_reactions: 0x00000040,
	view_audit_log: 0x00000080,
	priority_speaker: 0x00000100,
	stream: 0x00000200,
	view_channel: 0x00000400,
	send_messages: 0x00000800,
	send_tts_messages: 0x00001000,
	manage_messages: 0x00002000,
	embed_links: 0x00004000,
	attach_files: 0x00008000,
	read_message_history: 0x00010000,
	mention_everyone: 0x00020000,
	use_external_emojis: 0x00040000,
	view_guild_insights: 0x00080000,
	connect: 0x00100000,
	speak: 0x00200000,
	mute_members: 0x00400000,
	deafen_members: 0x00800000,
	move_members: 0x01000000,
	use_vad: 0x02000000,
	change_nickname: 0x04000000,
	manage_nicknames: 0x08000000,
	manage_roles: 0x10000000,
	manage_webhooks: 0x20000000,
	manage_emojis: 0x40000000,
};

export function convertTime(time: string): number {
	if (!time) return NaN;
	switch (time.match(/\D/)[0].toLowerCase()) {
		case 's':
			return Math.floor(parseFloat(time) * 1000 + +new Date());
		case 'm':
			return Math.floor(parseFloat(time) * 60000 + +new Date());
		case 'h':
			return Math.floor(parseFloat(time) * 3600000 + +new Date());
		case 'd':
			return Math.floor(parseFloat(time) * 86400000 + +new Date());
	}
}

export async function fetchTextChannel(
	guild: Discord.Guild,
	channel: string
): Promise<Discord.TextChannel> {
	const c = guild.channels.resolve(channel);

	return c && c.type === 'text' ? (c as Discord.TextChannel) : undefined;
}

export const eventFlags = {
	channelcreate: 0x1,
	channeldelete: 0x2,
	channelupdate: 0x4,
	ban: 0x8,
	unban: 0x10,
	join: 0x20,
	leave: 0x40,
	messagedelete: 0x80,
	messagedeletebulk: 0x100,
	messageedit: 0x200,
	mute: 0x400,
	unmute: 0x800,
	warning: 0x1000,
};

export const eventKeyName = {
	channelcreate: 'channelCreate',
	channeldelete: 'channelDelete',
	channelupdate: 'channelUpdate',
	ban: 'ban',
	unban: 'unban',
	join: 'join',
	leave: 'leave',
	messagedelete: 'messageDelete',
	messagedeletebulk: 'messageDeleteBulk',
	messageedit: 'messageEdit',
	mute: 'mute',
	unmute: 'unmute',
	warning: 'warning',
};
