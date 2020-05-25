let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./logs.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to logs.db.');
});
db.run(`CREATE TABLE IF NOT EXISTS logs(
	guild TEXT UNIQUE NOT NULL,
	modLogChannel TEXT NOT NULL,
	messageLogChannel TEXT NOT NULL,
	serverLogChannel TEXT NOT NULL,
	channelPinsUpdate BOOLEAN DEFAULT false NOT NULL,
	messageDelete BOOLEAN DEFAULT false NOT NULL,
	messageDeleteBulk BOOLEAN DEFAULT false NOT NULL,
	messageReactionAdd BOOLEAN DEFAULT false NOT NULL,
	messageReactionRemove BOOLEAN DEFAULT false NOT NULL,
	messageReactionRemoveAll BOOLEAN DEFAULT false NOT NULL,
	messageReactionRemoveEmoji BOOLEAN DEFAULT false NOT NULL,
	messageUpdate BOOLEAN DEFAULT false NOT NULL,
	inviteCreate BOOLEAN DEFAULT false NOT NULL,
	inviteDelete BOOLEAN DEFAULT false NOT NULL,
	channelCreate BOOLEAN DEFAULT false NOT NULL,
	channelDelete BOOLEAN DEFAULT false NOT NULL,
	channelUpdate BOOLEAN DEFAULT false NOT NULL,
	emojiCreate BOOLEAN DEFAULT false NOT NULL,
	emojiDelete BOOLEAN DEFAULT false NOT NULL,
	emojiUpdate BOOLEAN DEFAULT false NOT NULL,
	guildUpdate BOOLEAN DEFAULT false NOT NULL,
	guildIntegrationsUpdate BOOLEAN DEFAULT false NOT NULL,
	guildMemberAdd BOOLEAN DEFAULT false NOT NULL,
	guildMemberRemove BOOLEAN DEFAULT false NOT NULL,
	guildMemberUpdate BOOLEAN DEFAULT false NOT NULL,
	roleCreate BOOLEAN DEFAULT false NOT NULL,
	roleDelete BOOLEAN DEFAULT false NOT NULL,
	roleUpdate BOOLEAN DEFAULT false NOT NULL,
	userUpdate BOOLEAN DEFAULT false NOT NULL,
	webhookUpdate BOOLEAN DEFAULT false NOT NULL,
	guildBanAdd BOOLEAN DEFAULT false NOT NULL,
	guildBanRemove BOOLEAN DEFAULT false NOT NULL
);`);

const settings = [
	'channelPinsUpdate',
	'messageDelete',
	'messageDeleteBulk',
	'messageReactionAdd',
	'messageReactionRemove',
	'messageReactionRemoveAll',
	'messageReactionRemoveEmoji',
	'messageUpdate',
	'inviteCreate',
	'inviteDelete',
	'channelCreate',
	'channelDelete',
	'channelUpdate',
	'emojiCreate',
	'emojiDelete',
	'emojiUpdate',
	'guildUpdate',
	'guildIntegrationsUpdate',
	'guildMemberAdd',
	'guildMemberRemove',
	'guildMemberUpdate',
	'roleCreate',
	'roleDelete',
	'roleUpdate',
	'userUpdate',
	'webhookUpdate',
	'guildBanAdd',
	'guildBanRemove'
]

module.exports = {
	run: async function (message, args) {
		if(args[1]=='channel'){
			if(args[2]=='mod')
				db.run(`SELECT * FROM logs WHERE guild = ${message.guild.id}`, (err, column)=>{
					if(err)
						throw err;
						
					if(column!=undefined)
						return message.channel.send('Please set a default logging channel with: `log channel #channeName`');

					db.run(`REPLACE INTO logs(guild, modLogChannel) VALUES (${message.guild.id}, ${message.mentions.channels.first().id}`, (err, res)=>{
						if(err)
							throw err;
						message.channel.send(`Logging channel set to: <#${message.channels.mentions.first().id}>`);
					});
				});
			else if(args[2]=='message')
				db.run(`SELECT * FROM logs WHERE guild = ${message.guild.id}`, (err, column)=>{
					if(err)
						throw err;
						
					if(column!=undefined)
						return message.channel.send('Please set a default logging channel with: `log channel #channeName`');

					db.run(`REPLACE INTO logs(guild, messageLogChannel) VALUES (${message.guild.id}, ${message.mentions.channels.first().id}`, (err, res)=>{
						if(err)
							throw err;
						message.channel.send(`Logging channel set to: <#${message.channels.mentions.first().id}>`);
					});
				});
			else if(args[2]=='server')
				db.run(`SELECT * FROM logs WHERE guild = ${message.guild.id}`, (err, column)=>{
					if(err)
						throw err;
						
					if(column!=undefined)
						return message.channel.send('Please set a default logging channel with: `log channel #channeName`');

					db.run(`REPLACE INTO logs(guild, serverLogChannel) VALUES (${message.guild.id}, ${message.mentions.channels.first().id}`, (err, res)=>{
						if(err)
							throw err;
						message.channel.send(`Logging channel set to: <#${message.channels.mentions.first().id}>`);
					});
				});
			else
				db.run(`SELECT * FROM logs WHERE guild = ${message.guild.id}`, (err, column)=>{
					if(err)
						throw err;
						
					if(column!=undefined);
						message.channel.send('No logging is currently enabled, please use the command `log enable all` too enable all logging.');
					if(!message.mentions.channels.first())
						return;
					db.run(`INSERT OR REPLACE INTO logs(guild, modLogChannel, messageLogChannel, serverLogChannel) VALUES (${message.guild.id}, ${message.mentions.channels.first().id}, ${message.mentions.channels.first().id}, ${message.mentions.channels.first().id})`, (err, res)=>{
						if(err)
							throw err;
						message.channel.send(`Logging channel set to <#${message.mentions.channels.first().id}>`);
					});
				});
		} else if(args[1]=='enable') {
			if(args[2]=='all')
				db.run(`UPDATE logs SET channelPinsUpdate = true,messageDelete = true,messageDeleteBulk = true,messageReactionAdd = true,messageReactionRemove = true,messageReactionRemoveAll = true,messageReactionRemoveEmoji = true,messageUpdate = true,inviteCreate = true,inviteDelete = true,channelCreate = true,channelDelete = true,channelUpdate = true,emojiCreate = true,emojiDelete = true,emojiUpdate = true,guildUpdate = true,guildIntegrationsUpdate = true,roleCreate = true,roleDelete = true,roleUpdate = true,webhookUpdate = true,guildBanAdd = true,guildBanRemove = true,guildMemberAdd = true,guildMemberRemove = true,guildMemberUpdate = true,userUpdate = true WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(args[2]=='message')
				db.run(`UPDATE logs SET channelPinsUpdate = true,messageDelete = true,messageDeleteBulk = true,messageReactionAdd = true,messageReactionRemove = true,messageReactionRemoveAll = true,messageReactionRemoveEmoji = true,messageUpdate = true,inviteCreate = true,inviteDelete = true WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err});
			else if(args[2]=='server')
				db.run(`UPDATE logs SET channelCreate = true,channelDelete = true,channelUpdate = true,emojiCreate = true,emojiDelete = true,emojiUpdate = true,guildUpdate = true,guildIntegrationsUpdate = true,roleCreate = true,roleDelete = true,roleUpdate = true,webhookUpdate = true WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(args[2]=='mod')
				db.run(`UPDATE logs SET guildBanAdd = true,guildBanRemove = true,guildMemberAdd = true,guildMemberRemove = true,guildMemberUpdate = true,userUpdate = true WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(settings.includes(args[2]))
				db.run(`UPDATE logs SET ${args[2]} = true WHERE guild = "${message.guild.id}"`);
		} else if(args[1]=='disable') {
			if(args[2]=='all')
				db.run(`UPDATE logs SET channelPinsUpdate = false,messageDelete = false,messageDeleteBulk = false,messageReactionAdd = false,messageReactionRemove = false,messageReactionRemoveAll = false,messageReactionRemoveEmoji = false,messageUpdate = false,inviteCreate = false,inviteDelete = false,channelCreate = false,channelDelete = false,channelUpdate = false,emojiCreate = false,emojiDelete = false,emojiUpdate = false,guildUpdate = false,guildIntegrationsUpdate = false,roleCreate = false,roleDelete = false,roleUpdate = false,webhookUpdate = false,guildBanAdd = false,guildBanRemove = false,guildMemberAdd = false,guildMemberRemove = false,guildMemberUpdate = false,userUpdate = false WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(args[2]=='message')
				db.run(`UPDATE logs SET channelPinsUpdate = false,messageDelete = false,messageDeleteBulk = false,messageReactionAdd = false,messageReactionRemove = false,messageReactionRemoveAll = false,messageReactionRemoveEmoji = false,messageUpdate = false,inviteCreate = false,inviteDelete = false WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err});
			else if(args[2]=='server')
				db.run(`UPDATE logs SET channelCreate = false,channelDelete = false,channelUpdate = false,emojiCreate = false,emojiDelete = false,emojiUpdate = false,guildUpdate = false,guildIntegrationsUpdate = false,roleCreate = false,roleDelete = false,roleUpdate = false,webhookUpdate = false WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(args[2]=='mod')
				db.run(`UPDATE logs SET guildBanAdd = false,guildBanRemove = false,guildMemberAdd = false,guildMemberRemove = false,guildMemberUpdate = false,userUpdate = false WHERE guild = "${message.guild.id}"`, err=>{if(err) throw err;});
			else if(settings.includes(args[2]))
				db.run(`UPDATE logs SET ${args[2]} = false WHERE guild = "${message.guild.id}"`);
		} else {
			db.all(`SELECT * FROM logs WHERE guild = "${message.guild.id}"`, (err, rows)=>{
				if(!rows[0]) 
					return message.channel.send('No logging set up!');
				let columns = rows[0];
				let messageEmbed = {
					embed: {
						title: 'Message log status',
						color: 0xFF8000,
						fields: [
							{
								name: 'Message change',
								inline: true,
								value: `channelPinsUpdate ${columns['channelPinsUpdate']?':white_check_mark:':':x:'}
								messageDelete ${columns['messageDelete']?':white_check_mark:':':x:'}
								messageDeleteBulk ${columns['messageDeleteBulk']?':white_check_mark:':':x:'}
								messageUpdate ${columns['messageUpdate']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Message reactions',
								inline: true,
								value: `messageReactionAdd ${columns['messageReactionAdd']?':white_check_mark:':':x:'}
								messageReactionRemove ${columns['messageReactionRemove']?':white_check_mark:':':x:'}
								messageReactionRemoveAll ${columns['messageReactionRemoveAll']?':white_check_mark:':':x:'}
								messageReactionRemoveEmoji ${columns['messageReactionRemoveEmoji']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Miscellaneous message',
								inline: false,
								value: `inviteCreate ${columns['inviteCreate']?':white_check_mark:':':x:'}
								inviteDelete ${columns['inviteDelete']?':white_check_mark:':':x:'}`
							}
						]
					}
				};
				let serverEmbed = {
					embed: {
						title: 'Server log status',
						color: 0xFF8000,
						fields: [
							{
								name: 'Channel',
								inline: true,
								value: `channelCreate ${columns['channelCreate']?':white_check_mark:':':x:'}
								channelDelete ${columns['channelDelete']?':white_check_mark:':':x:'}
								channelUpdate ${columns['channelUpdate']?':white_check_mark:':':x:'}
								webhookUpdate ${columns['webhookUpdate']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Emoji',
								inline: true,
								value: `emojiCreate ${columns['emojiCreate']?':white_check_mark:':':x:'}
								emojiDelete ${columns['emojiDelete']?':white_check_mark:':':x:'}
								emojiUpdate ${columns['emojiUpdate']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Role',
								inline: true,
								value: `roleCreate: ${columns['roleCreate']?':white_check_mark:':':x:'}
								roleDelete ${columns['roleDelete']?':white_check_mark:':':x:'}
								roleUpdate ${columns['roleUpdate']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Guild',
								inline: true,
								value: `guildUpdate ${columns['guildUpdate']?':white_check_mark:':':x:'}
								guildIntegrationsUpdate ${columns['guildIntegrationsUpdate']?':white_check_mark:':':x:'}`
							}
						]
					}
				};
				let moderationEmbed = {
					embed: {
						title: 'Moderation log status',
						color: 0xFF8000,
						fields: [
							{
								name: 'Bans',
								inline: true,
								value: `guildBanAdd ${columns['guildBanAdd']?':white_check_mark:':':x:'}
								guildBanRemove ${columns['guildBanRemove']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Join/leave',
								inline: true,
								value: `guildMemberAdd ${columns['guildMemberAdd']?':white_check_mark:':':x:'}
								guildMemberRemove ${columns['guildMemberRemove']?':white_check_mark:':':x:'}`
							},
							{
								name: 'Member change',
								inline: true,
								value: `guildMemberUpdate ${columns['guildMemberUpdate']?':white_check_mark:':':x:'}
								userUpdate ${columns['userUpdate']?':white_check_mark:':':x:'}`
							}
						]
					}
				};
				message.channel.send(messageEmbed);
				message.channel.send(serverEmbed);
				message.channel.send(moderationEmbed);
			});
		}
	},
	description: 'Sets, clears, and displays your log settings',
	detailed: 'Lets you set, display, modify, and clear your senpai to your hearts content',
	examples: prefix => `${prefix}log channel #logs, ${prefix}log enable all`,
	name: 'log',
	perms: ["ADMINISTRATOR"]
};