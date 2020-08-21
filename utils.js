const asyncDB = {
	/**
	 * 
	 * @param {object} db sqlite3 database
	 * @param {string} sql query
	 * @param {string[]} args sql query arguments
	 * @returns {promise} query result
	 */
	get: async function (db, sql, args){
		return new Promise(function (resolve, reject) {
			db.get(sql, args, function (error, row) {
				if (error)
					reject(error);
				else
					resolve(row);
			});
		});
	},
	/**
	 * 
	 * @param {object} db sqlite3 database
	 * @param {string} sql query
	 * @param {string[]} args sql query arguments
	 * @returns {promise} query result as an array of objects
	 */
	all: async function (db, sql, args){
		return new Promise(function (resolve, reject) {
			db.all(sql, args, function (error, rows) {
				if (error)
					reject(error);
				else
					resolve(rows);
			});
		});
	},
	/**
	 * 
	 * @param {object} db sqlite3 database
	 * @param {string} sql query
	 * @param {string[]} args sql query arguments
	 * @returns {promise} null
	 */
	run: async function (db, sql, args){
		return new Promise(function (resolve, reject) {
			db.run(sql, args, function (error) {
				if (error)
					reject(error);
				else
					resolve();
			});
		});
	}
};

const permissionsFlags = {
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
	manage_emojis: 0x40000000
}

module.exports = {asyncDB, permissionsFlags};