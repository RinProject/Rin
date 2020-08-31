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
};

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/database.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS mutes(guild TEXT NOT NULL, member TEXT NOT NULL, ends TEXT NOT NULL, reason TEXT NOT NULL, moderator TEXT NOT NULL);');

db.run('CREATE TABLE IF NOT EXISTS muteRole(guild TEXT UNIQUE NOT NULL, role TEXT NOT NULL);');

function convertTime(time){
	if(!time)
		return NaN;
	switch(time.match(/\D/)[0].toLowerCase()){
		case 's':
			return Math.floor(parseFloat(time) * 1000 + +new Date);
		case 'm':
			return Math.floor(parseFloat(time) * 60000 + +new Date);
		case 'h':
			return Math.floor(parseFloat(time) * 3600000 + +new Date);
		case 'd':
			return Math.floor(parseFloat(time) * 86400000 + +new Date);
	}
}

let checkingMutes = false;

const mute = {
	mute: async function (guild, member, time, reason, moderator, channel){
		let mute = await asyncDB.get(db, 'SELECT member FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(mute&&mute.member)
			throw 'User Already Muted';
			//return channel.send({embed: {title: 'Cannot mute user', description: 'User already muted.', color: colors.error}}), undefined;
		let role = await asyncDB.get(db, 'SELECT role FROM muteRole WHERE guild = (?);', [guild.id]);
		if(role)
			role = guild.roles.resolve(role.role);
		
		if(!role){
			role = await guild.roles.create({
				data: {
					name: 'Muted',
					color: 'GREY',
					permissions: 0
				},
				reason: 'Auto generated mute role'
			});
			await guild.channels.cache.each(async(channel) => {
				if(channel.type==='text')
					await channel.createOverwrite(role, {
						SEND_MESSAGES: false
					}).catch();
				else if(channel.type==='voice')
					await channel.createOverwrite(role, {
						SPEAK: false
					}).catch();
			});
			await asyncDB.run(db, 'INSERT OR REPLACE INTO muteRole(guild, role) VALUES((?), (?));', [guild.id, role.id]);
		}
		if(!reason)
			reason = 'No reason provided.';
		member.roles.add(role, `Muted by ${moderator.tag}(id: ${moderator.id}) for "${reason}"`);
		await asyncDB.run(
			db,
			'INSERT OR REPLACE INTO mutes(member, guild, reason, ends, moderator) VALUES((?), (?), (?), (?), (?));',
			[member.id, guild.id, reason, time||'inf', moderator.id]
		);
		let logChannel = await asyncDB.get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [guild.id])
		if (logChannel && logChannel.modLogChannel)
			guild.channels.resolve(logChannel.modLogChannel).send({embed:{
				title: 'User muted',
				description: `${member.toString()} muted by ${moderator.toString()}\n\nReason:\n${reason}`,
				color: colors.negative,
				footer: {
					text: time?'Mute ending':'Mute indefinite'
				},
				timestamp: time
			}});
	},
	unmute: async function(guild, member){
		let role = await asyncDB.get(db, 'SELECT role FROM muteRole WHERE guild = (?);', [guild.id]);
		await asyncDB.run(db, 'DELETE FROM mutes WHERE guild = (?) AND member = (?);', [guild.id, member.id]);
		if(!role)
			throw 'No muted role found';
		if(!member.roles.cache.get(role.role))
			throw 'User not muted';
		member.roles.remove(role.role, 'Mute time over');

		let logChannel = await asyncDB.get(db, 'SELECT modLogChannel FROM logs WHERE guild = (?)', [guild.id])
		if (logChannel && logChannel.modLogChannel)
			guild.channels.resolve(logChannel.modLogChannel).send({embed:{
				title: 'User unmuted',
				description: `${member.toString()} unmuted`,
				color: colors.success
			}});
	},
	startMuteCheck: function(){
		if(!checkingMutes){
			setInterval(checkMutes, 30000);
		}
	}
};
async function checkMutes(){
	const toUnmute = await asyncDB.all(db, 'SELECT * FROM mutes WHERE ends < (?);', [+new Date]);
	toUnmute.forEach(async (currentMute) =>{
		let guild = client.guilds.resolve(currentMute.guild);
		let member;
		try {
			member = guild.members.resolve(currentMute.member);
		} catch (e) {}
		if(!guild || !member)
			return asyncDB.run(db, 'DELETE FROM mutes WHERE guild = (?) AND member = (?);', [currentMute.guild, currentMute.member]);
		mute.unmute(guild, member).catch(e=>{});
	});
}

module.exports = {asyncDB, permissionsFlags, mute, convertTime};