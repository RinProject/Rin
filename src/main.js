const Discord = require('discord.js');
const client = new Discord.Client({disableMentions: "everyone", partials: ['MESSAGE', 'REACTION']});
const sqlite3 = require('sqlite3').verbose();

global.client = client;

let db = new sqlite3.Database('./databases/database.db', (err) => {
	if (err)
		return console.error(err.message);
});

//load config file
const config = (() => {
	let configuration = require("../config.json");
	configuration.directory = `${__dirname}\\${configuration.directory}`;
	Object.keys(configuration.colors).forEach(key => {
		// TODO: implement usage of colours from config in commands
		configuration.colors[key]=parseInt(configuration.colors[key], 16);
	});
	client.colors = configuration.colors;
	return configuration 
})();
client.prefix = config.prefix;
client.owners = config.owners;

global.colors = config.colors;

client.on('ready', () => {
	//print some information about the bot
	console.log(`logged in as ${client.user.username}#${client.user.discriminator} with ${client.guilds.cache.array().length} guilds! Using the prefix ${config.prefix}`);
	init(config, client);
	if(config.enableWeb)
		require('./web')({port: config.port, clientSecret: config.clientSecret});
});

const { handler, init, errorLog } = require('./handler');

const { get, all, run } = require('./utils').asyncDB;

client.on('message', async (message) => {
	if(message.author.bot) return;
	if(!await handler(message)&&message.guild){
		let role = message.guild.roles.resolve((await get(db, 'SELECT role FROM expRole WHERE guild = (?);', [message.guild.id])||{}).role);
		if(role && message.member.roles.cache.get(role.id))
			return;
		let expGain = 10;
		let time = +new Date;
		let xp = await get(db, 'SELECT * FROM exp WHERE user = (?) AND guild = (?)', [message.author.id, message.guild.id]);
		if(xp && xp.exp){
			if(xp.lastMessage < time - 60000){
				run(db, 'UPDATE exp SET exp = (?), lastMessage = (?) WHERE user = (?) AND guild = (?)', [xp.exp + expGain, time, message.author.id, message.guild.id]);
			}
		}
		else{
			run(db, 'INSERT INTO exp(user, exp, lastMessage, guild) VALUES((?), (?), (?), (?))', [message.author.id, expGain, time, message.guild.id]);
		}
	}
});

// client.on('guildCreate', guild => {

// });

//Message change logs
client.on('channelPinsUpdate', (channel, time) => {
	if (!channel.guild) return;
	db.all(`SELECT channelPinsUpdate, messageLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
		client.channels.cache.get(rows[0]['messageLogChannel']).send({
			embed: {
				title: 'Channel pin update',
				description: `Pins in ${channel} updated`
			}
		})
		if (err)
			errorLog(err);
	});
});

client.on('messageDelete', (message) => {
	if (!message.guild) return;
	db.all(`SELECT messageDelete, messageLogChannel FROM logs WHERE guild = "${message.channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['messageDelete'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: message.author.tag,
						iconURL: message.author.avatarURL()
					},
					color: 0xcc1020,
					title: `Message deleted in ${message.channel.name}`,
					description: `${message.channel.toString()}\n${message.content}`,
					footer: {
						text: `uid: ${message.author.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('messageDeleteBulk', (messages) => {
	if (!messages.first().guild) return;
	db.all(`SELECT messageDelete, messageLogChannel FROM logs WHERE guild = "${messages.first().guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['messageDelete']) {
			let fields = [];
			messages.each(message => {
				let content = message.content
				if (!content) content = `Message data unavailable, message likely included an attachment or embed.`;
				fields.push({
					name: `${message.author.tag} | id: ${message.author.id}`,
					inline: false,
					value: content
				});
			})
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					color: 0xcc1020,
					title: 'Message bulk deletion',
					description: `${messages.size} messages were deleted in ${messages.first().channel}`,
					fields: fields
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

client.on('messageUpdate', (oldMessage, newMessage) => {
	if (!newMessage.guild) return;
	db.all(`SELECT messageUpdate, messageLogChannel FROM logs WHERE guild = "${newMessage.channel.guild.id}"`, (err, rows) => {
		if (rows && rows[0] && rows[0]['messageUpdate'] && (oldMessage.content || newMessage.content))
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: newMessage.author.tag,
						iconURL: newMessage.author.avatarURL()
					},
					color: 0xcc1020,
					title: 'Message edited',
					description: `Channel: ${newMessage.channel.toString()}\n[Message](${newMessage.url})`,
					fields: [
						{
							name: 'Pre edit message',
							inline: true,
							value: oldMessage.content
						},
						{
							name: 'Edited message',
							inline: true,
							value: newMessage.content
						}
					],
					footer: {
						text: `uid: ${newMessage.author.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

//Message reaction logs
client.on('messageReactionAdd', async (reaction, user) => {
	if(reaction.partial)
		try{
			reaction.fetch();
		}catch(e){
			console.error(e);
			return;
		}
	if (!reaction.message.guild) return;
	db.all(`SELECT roleID FROM reactRoles WHERE messageID = (?) AND emojiID = (?);`, [reaction.message.id, reaction.emoji.id], (err, rows) => {
		if (err)
			console.error(err);
		if (rows && rows[0] && rows[0].roleID)
			reaction.message.guild.members.cache.get(user.id).roles.add(rows[0].roleID, 'Reaction role')
			// .catch(e=>{});
	});
	db.all(`SELECT messageReactionAdd, messageLogChannel FROM logs WHERE guild = "${reaction.message.channel.guild.id}"`, (err, rows) => {
		if (rows && rows[0] && rows[0]['messageReactionAdd'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.avatarURL()
					},
					color: 0x10cc10,
					title: `Reaction added`,
					description: `${user.tag} reacted with ${reaction.emoji.toString()}\n[Message](${reaction.message.url})`,
					footer: {
						text: `uid: ${user.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('messageReactionRemove', (reaction, user) => {
	if(reaction.partial)
		try{
			reaction.fetch();
		}catch(e){
			console.error(e);
			return;
		}
	if (!reaction.message.guild) return;
	db.all(`SELECT roleID FROM reactRoles WHERE messageID = (?) AND emojiID = (?);`, [reaction.message.id, reaction.emoji.id], (err, rows) => {
		if (err)
			console.error(err);
		if (rows && rows[0] && rows[0].roleID)
			reaction.message.guild.members.cache.get(user.id).roles.remove(rows[0].roleID, 'Reaction role')
			.catch(e=>{});
	});
	db.all(`SELECT messageReactionRemove, messageLogChannel FROM logs WHERE guild = "${reaction.message.channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['messageReactionRemove'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.avatarURL()
					},
					color: 0xcc1020,
					title: `Reaction removed`,
					description: `${user.tag} removed reaction ${reaction.emoji.toString()}\n[Message](${reaction.message.url})`,
					footer: {
						text: `uid: ${user.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('messageReactionRemoveAll', (message) => {
	if (!message.guild) return;
	db.all(`SELECT messageReactionRemoveAll, messageLogChannel FROM logs WHERE guild = "${message.channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['messageReactionRemoveAll'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: message.author.tag,
						iconURL: message.author.avatarURL()
					},
					color: 0xcc1020,
					title: `All reactions removed from: `,
					description: `${message.content}\n[Message](${message.url})`,
					footer: {
						text: `uid: ${message.author.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('messageReactionRemoveEmoji', (messageReaction) => {
	if (!messageReaction.message.guild) return;
	db.all(`SELECT messageReactionRemoveEmoji, messageLogChannel FROM logs WHERE guild = "${messageReaction.message.channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['messageReactionRemoveEmoji'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: message.user.tag,
						iconURL: messageReaction.message.user.avatarURL()
					},
					color: 0xcc1020,
					title: `Reaction removed`,
					description: `Removed reaction ${messageReaction.emoji.toString()}\n[Message](${messageReaction.message.url})`,
					footer: {
						text: `Message id: ${messageReaction.message.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

//Message miscellaneous
client.on('inviteCreate', invite => {
	db.all(`SELECT inviteCreate, messageLogChannel FROM logs WHERE guild = "${invite.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['inviteCreate'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: invite.inviter.tag,
						iconURL: invite.inviter.avatarURL()
					},
					color: 0x10cc10,
					title: 'Invite created',
					fields: [
						{
							name: 'Invite code',
							inline: true,
							value: invite.code
						},
						{
							name: 'Lifetime',
							inline: true,
							value: `${invite.maxAge / 3600}hours`
						},
						{
							name: 'Max uses',
							inline: true,
							value: invite.maxUses
						}
					],
					footer: {
						text: `uid: ${invite.inviter.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('inviteDelete', invite => {
	db.all(`SELECT inviteDelete, messageLogChannel FROM logs WHERE guild = "${invite.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['inviteDelete'])
			client.channels.cache.get(rows[0]['messageLogChannel']).send({
				embed: {
					author: {
						name: invite.inviter.tag,
						iconURL: invite.inviter.avatarURL()
					},
					color: 0xcc1020,
					title: 'Invite deleted',
					fields: [
						{
							name: 'Invite code',
							inline: true,
							value: invite.code
						},
						{
							name: 'Uses',
							inline: true,
							value: invite.uses
						}
					],
					footer: {
						text: `uid: ${invite.inviter.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

//Server channel
client.on('channelCreate', channel => {
	if (!channel.guild) return;
	db.all(`SELECT channelCreate, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['channelCreate'])
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					color: 0x10cc10,
					title: 'New channel created',
					fields: [
						{
							name: 'Name',
							inline: true,
							value: channel.name
						},
						{
							name: 'Type',
							inline: true,
							value: channel.type
						}
					],
					footer: {
						text: `Channel id: ${channel.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('channelDelete', channel => {
	if (!channel.guild) return;
	db.all(`SELECT channelDelete, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['channelDelete'])
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					color: 0xcc1020,
					title: 'Channel deleted',
					fields: [
						{
							name: 'Name',
							inline: true,
							value: channel.name
						},
						{
							name: 'Type',
							inline: true,
							value: channel.type
						}
					],
					footer: {
						text: `Channel id: ${channel.id}`
					}
				}
			});
		if (err)
			errorLog(err);
	});
});


const channelPropertiesToCheck = [
	['name', 'Name'],
	['parent', 'Category'],
	['parentID', 'CategoryID'],
	['permissionsLocked', 'Match category permissions']
];
client.on('channelUpdate', (oldChannel, newChannel) => {
	if (!newChannel.guild) return;
	db.all(`SELECT channelUpdate, serverLogChannel FROM logs WHERE guild = "${newChannel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['channelUpdate']) {
			let embed = {
				author: {
					name: newChannel.name,
					iconURL: newChannel.guild.iconURL()
				},
				color: 0x1080cc,
				title: 'Channel updated',
				description: `Channel type: ${newChannel.type}`,
				fields: [],
				footer: {
					text: `Channel id: ${newChannel.id}`
				}
			}
			channelPropertiesToCheck.forEach(property => {
				if (newChannel[property[0]] != oldChannel[property[0]])
					embed.fields.push({
						name: property[1],
						inline: true,
						value: `Changed from ${newChannel[property[0]]} to ${oldChannel[property[0]]}`
					});
			});
			// TODO check permissions
			if (embed.fields[0])
				client.channels.cache.get(rows[0]['serverLogChannel']).send({
					embed: embed
				});
		}
		if (err)
			errorLog(err);
	});
});

client.on('webhookUpdate', (channel) => {
	db.all(`SELECT webhookUpdate, serverLogChannel FROM logs WHERE guild = "${channel.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['webhookUpdate']) {
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					author: {
						name: channel.name,
						iconURL: channel.guild.iconURL()
					},
					color: 0x1080cc,
					title: 'Channel updated',
					description: `Webhook changes have occurred in ${channel.toString()}`,
					footer: {
						text: `Channel id: ${channel.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

//Server emote events
client.on('emojiCreate', emoji => {
	db.all(`SELECT emojiCreate, serverLogChannel FROM logs WHERE guild = "${emoji.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['emojiCreate'])
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					author: {
						name: emoji.name,
						iconURL: emoji.url
					},
					color: 0x10cc10,
					description: 'Emoji created',
					image: {
						url: emoji.url,
						height: 512,
						width: 512
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('emojiDelete', emoji => {
	db.all(`SELECT emojiDelete, serverLogChannel FROM logs WHERE guild = "${emoji.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['emojiDelete'])
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					author: {
						name: emoji.name,
						iconURL: emoji.url
					},
					color: 0xcc1020,
					description: 'Emoji deleted',
					image: {
						url: emoji.url,
						height: 512,
						width: 512
					}
				}
			});
		if (err)
			errorLog(err);
	});
});

client.on('emojiUpdate', (oldEmoji, newEmoji) => {
	db.all(`SELECT emojiUpdate, serverLogChannel FROM logs WHERE guild = "${newEmoji.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['emojiUpdate']) {
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					author: {
						name: newEmoji.name,
						iconURL: newEmoji.url
					},
					color: 0x1080cc,
					title: 'Emoji changed',
					fields: [
						{
							name: 'Old name',
							inline: true,
							value: oldEmoji.name
						},
						{
							name: 'New name',
							inline: true,
							value: newEmoji.name
						}
					]
				}
			});
		}
		if (err)
			errorLog(err);
	});
});


//server guild event
const guildProperties = [
	'afkChannel',
	'afkChannelID',
	'afkTimeout',
	'applicationID',
	'defaultMessageNotifications',
	'description',
	'embedChannel',
	'embedChannelID',
	'embedEnabled',
	'explicitContentFilter',
	'mfaLevel',
	'name',
	'nameAcronym',
	'owner',
	'ownerID',
	'partnered',
	'premiumSubscriptionCount',
	'premiumTier',
	'publicUpdatesChannel',
	'publicUpdatesChannelID',
	'region',
	'rulesChannel',
	'rulesChannelID',
	'systemChannel',
	'systemChannelID',
	'vanityURLCode',
	'verificationLevel',
	'verified',
	'widgetChannel',
	'widgetChannelID',
	'widgetEnabled'
];
client.on('guildUpdate', (oldGuild, newGuild) => {
	db.all(`SELECT guildUpdate, serverLogChannel FROM logs WHERE guild = "${newGuild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildUpdate']) {
			let embed = {
				author: {
					name: newGuild.name,
					iconURL: newGuild.iconURL()
				},
				color: 0x1080cc,
				title: 'Guild updated',
				fields: [],
				footer: {
					text: `Guild id: ${newGuild.id}`
				}
			}
			guildProperties.forEach(property => {
				if (oldGuild[property] != newGuild[property])
					embed.fields.push({
						name: property,
						inline: true,
						value: `Changed from ${oldGuild[property]} to ${newGuild[property]}`
					});
			});
			// TODO feature change
			if (embed.fields[0])
				client.channels.cache.get(rows[0]['serverLogChannel']).send({
					embed: embed
				});
		}
		if (err)
			errorLog(err);
	});
});

client.on('guildIntegrationsUpdate', guild => {
	db.all(`SELECT guildIntegrationsUpdate, serverLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildIntegrationsUpdate']) {
			client.channels.cache.get(rows[0]['serverLogChannel']).send({
				embed: {
					author: {
						name: guild.name,
						iconURL: guild.iconURL()
					},
					color: 0x1080cc,
					description: 'Guild integrations updated.',
					footer: {
						text: `Guild id: ${guild.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

//moderation bans

client.on('guildBanAdd', (guild, user) => {
	db.all(`SELECT guildBanAdd, modLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildBanAdd']) {
			client.channels.cache.get(rows[0]['modLogChannel']).send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.displayAvatarURL()
					},
					color: 0xcc1020,
					description: 'User banned from guild.',
					footer: {
						text: `id: ${user.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

client.on('guildBanRemove', (guild, user) => {
	db.all(`SELECT guildBanRemove, modLogChannel FROM logs WHERE guild = "${guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildBanRemove']) {
			client.channels.cache.get(rows[0]['modLogChannel']).send({
				embed: {
					author: {
						name: user.tag,
						iconURL: user.displayAvatarURL()
					},
					color: 0xcc1020,
					description: 'User unbanned from guild.',
					footer: {
						text: `id: ${user.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

//join/leave

client.on('guildMemberAdd', (member) => {
	db.all(`SELECT guildMemberAdd, modLogChannel FROM logs WHERE guild = "${member.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildMemberAdd']) {
			client.channels.cache.get(rows[0]['modLogChannel']).send({
				embed: {
					author: {
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL()
					},
					color: 0x10cc10,
					description: 'User joined the guild.',
					footer: {
						text: `id: ${member.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

client.on('guildMemberRemove', (member) => {
	db.all(`SELECT guildMemberRemove, modLogChannel FROM logs WHERE guild = "${member.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildMemberRemove']) {
			client.channels.cache.get(rows[0]['modLogChannel']).send({
				embed: {
					author: {
						name: member.user.tag,
						iconURL: member.user.displayAvatarURL()
					},
					color: 0xcc1020,
					description: 'User left the guild.',
					footer: {
						text: `id: ${member.id}`
					}
				}
			});
		}
		if (err)
			errorLog(err);
	});
});

//Member change

const memberProperties = [
	'displayHexColor',
	'displayName',
	'nickname'
]
client.on('guildMemberUpdate', (oldMember, newMember) => {
	db.all(`SELECT guildMemberUpdate, modLogChannel FROM logs WHERE guild = "${newMember.guild.id}"`, (err, rows) => {
		if (rows[0] && rows[0]['guildMemberUpdate']) {
			let embed = {
				author: {
					name: newMember.user.tag,
					iconURL: newMember.user.displayAvatarURL()
				},
				color: 0x1080cc,
				title: 'Guild member updated',
				description: newMember.toString(),
				fields: [],
				footer: {
					text: `id: ${newMember.id}`
				}
			}
			memberProperties.forEach(property => {
				if (oldMember[property] != newMember[property])
					embed.fields.push({
						name: property,
						inline: true,
						value: `Changed from ${oldMember[property]} to ${newMember[property]}`
					});
			});
			let change = oldMember.roles.cache.array().length - newMember.roles.cache.array().length,
				editRole;
			if (change > 0) {
				oldMember.roles.cache.each(role => {
					if (!newMember.roles.cache.get(role.id))
						editRole = role;
				});
			} else if (change < 0) {
				newMember.roles.cache.each(role => {
					if (!oldMember.roles.cache.get(role.id))
						editRole = role;
				});
			}
			if (editRole)
				embed.fields.push({
					name: change < 0 ? 'Role added' : 'Role removed',
					inline: true,
					value: editRole.toString()
				});

			// TODO perms

			if (embed.fields[0])
				client.channels.cache.get(rows[0]['modLogChannel']).send({
					embed: embed
				});
		}
		if (err)
			errorLog(err);
	});
});

client.login(config.token);