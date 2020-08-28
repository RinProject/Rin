const router = require('express').Router();
const fs = require('fs');
const dashboard = fs.readFileSync(__dirname+'/dashboard.html');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/database.db', (err) => {
	if(err)
		throw err;
});

let handlerDB = new sqlite3.Database('./databases/handler.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
});

const perms = require('../../utils').permissionsFlags;

async function fetchPerms(guild, user){
	if(guild&&guild.members)
		return guild.members.cache.get(user).permissions.bitfield||0;
	else
		return 0;
}

const {run, get, all} = require('../../utils').asyncDB;

let permsCheck = perms.kick_members | perms.ban_members | perms.administrator | perms.manage_guild | perms.manage_messages;

router.get('/', async (req, res)=>{
	if(!req.user)
		return res.render('error', {req: req, title: '403', content: 'You must be logged in to see this, you can login at the top right.'});
	let guilds = '';
	req.user.guilds.forEach(g=>{
		let guild = client.guilds.cache.get(g.id);
		if(!guild||fetchPerms(req.user.discordID)&permsCheck) return;
		const icon = guild.iconURL({size: 128});
		guilds+=`<li>${icon?`<img src="${icon}" />`:''}<a href="/dashboard/${guild.id}/">${guild.name}</a></li>`
	});
	let content = `<h1>Available dashboards</h1><hr /><ul class="guilds">${guilds}</ul>`;
	res.render('index', {req: req, content, title: 'Dashboard'})
});

router.get('/:guild/', (req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	if(!guild) return res.render('error', {req: req, title: '404', content: 'Guild not found'});
	res.redirect(`/dashboard/${req.params.guild}/settings`);
});

const pages = [
	'warnings',
	'logs',
	'settings',
	'embed'
]

router.get('/:guild/:page/', (req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	if(!guild) return res.render('error', {req: req, title: '404', content: 'Guild not found'});
	if(!req.user||!fetchPerms(guild, req.user.discordID)&permsCheck)
		return res.render('error', {req: req, title: '403', content: ' forbidden'});
	
	if(pages.includes(req.params.page))
		res.render('index', {req: req, content: dashboard, title: `Dashboard for ${guild.name}`});
	else
		res.render('error', {req: req, title: '404', content: 'Page not found'});
});

router.get('/:guild/get/:type/', async(req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	let userPerms = await fetchPerms(guild, req.user.discordID);
	if(!req.user||!userPerms&(perms.administrator|perms.manage_guild)){
		console.log(err);
		res.status(403);
		return res.send();
	}
	switch (req.params.type){
		case 'warnings':
			db.all('SELECT id, user, moderator, reason, time, active FROM warnings WHERE guild = (?) ORDER BY time DESC;', [req.params.guild], async (err, rows)=>{
				if(err){
					console.log(err);
					res.status(500);
					return res.send();
				}
				let users = {};
				rows.forEach(async (row)=>{
					let mod = users[row.moderator]||client.users.cache.get(row.moderator)||await client.users.fetch(row.moderator)||{tag: 'Unable to fetch'};
					row.moderator = {id: row.moderator, name: mod.tag};
					let user = users[row.user]||client.users.cache.get(row.user)||await client.users.fetch(row.user)||{tag: 'Unable to fetch'};
					row.user = {id: row.user, name: user.tag};
				});
				res.send(`{"name": "${guild.name.replace(/'/g, '\'')}", "warnings": ${JSON.stringify(rows)}}`);
			});
			break;
		case 'logs':
			db.get('SELECT * FROM logs WHERE guild = (?);', [req.params.guild], (err, row)=>{
				if(err)
					console.log(err);
				if(!guild) return res.sendStatus(404);
				res.send(JSON.stringify({name:guild.name.replace(/'/g, '\''),settings:row}));
			});
			break;
		case 'settings':
			let commands = (await all(handlerDB, 'SELECT command FROM disabledCommands WHERE guild = (?);', [req.params.guild])||{})
			commands.forEach((c,i)=>commands[i] = c.command);
			res.send(JSON.stringify({
				name:guild.name.replace(/'/g, '\''),
				settings:{
					prefix: (await get(handlerDB, 'SELECT * FROM prefixes WHERE guild = (?);', [req.params.guild])||{}).prefix||client.prefix,
					disabled: commands
				}
			}));
			break;
		case 'embed':
			if(!(userPerms&(perms.administrator|perms.manage_guild)))
				return res.sendStatus(404);
			let user = client.users.cache.get(req.user.discordID);
			let channels = [];
			guild.channels.cache.each(channel=>{
				if(channel.type == 'text')
					channels.push({id: channel.id, name: channel.name});
			});
			res.send(JSON.stringify({name:guild.name, data:
				{
					channels: channels,
					user: {
						tag: user.tag,
						pfp: user.displayAvatarURL(),
					}
				}
			}));
			break;
		default:
			res.sendStatus(404);
	}
});

const logProperties = require('../../JSONStorage/logProperties.json');
const prefix = require('../../handler/prefix');
const { isArray } = require('util');
const logSQL = `UPDATE logs SET ${logProperties.join('=(?),')}=(?) WHERE guild=(?);`;

router.post('/:guild/save/:type/', async(req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	switch (req.params.type){
		case 'logs':
			if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild)){
				return res.sendStatus(403);
			}
			let args = [];
			try{
				logProperties.forEach(property => {
					args.push(req.body[property]);
				});
				args.push(req.params.guild);
			}catch{
				return res.sendStatus(400);
			}
			db.get(logSQL, args, (err, row)=>{
				if(err){
					console.log(err);
					return res.sendStatus(500);
				}
				res.sendStatus(200);
			});	
			break;
		case 'prefix':
			if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild)){
				return res.sendStatus(403);
			}
			if(!req.body.prefix&&typeof(prefix)=='string')
				return res.sendStatus(400);
			handlerDB.get('INSERT OR REPLACE INTO prefixes(guild, prefix) VALUES((?), (?));', [req.params.guild, req.body.prefix], (err)=>{
				if(err){
					console.log(err);
					return res.sendStatus(500);
				}
				res.sendStatus(200);
			});	
			break;
	}
});

router.post('/:guild/send/embed/', async(req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild)){
		return res.sendStatus(403);
	}
	if(!req.body)
		return res.sendStatus(400);

	const input = req.body;
	let embed = {author: {}, footer:{}, thumbnail: {}, image: {}, fields: []};

	if(input.author&&typeof(input.author)=='string')
		embed.author.name = input.author;
	if(input.author_url&&typeof(input.author_url)=='string')
		embed.author.url = input.author_url;
	if(input.author_icon&&typeof(input.author_icon)=='string')
		embed.author.iconURL = input.author_icon;
	if(input.message_title&&typeof(input.message_title)=='string')
		embed.title = input.message_title;
	if(input.description&&typeof(input.description)=='string')
		embed.description = input.description;
	if(input.colour&&typeof(input.colour)=='string')
		embed.color = parseInt(input.colour.replace('#', ''), 16);
	if(input.thumbnail&&typeof(input.thumbnail)=='string')
		embed.thumbnail.url = input.thumbnail;
	if(input.image&&typeof(input.image)=='string')
		embed.image.url = input.image;
	if(input.footer&&typeof(input.footer)=='string')
		embed.footer.text = input.footer;
	if(input.footer_icon&&typeof(input.footer_icon)=='string')
		embed.footer.iconURL = input.footer_icon;

	if(input.fields&&isArray(input.fields)){
		let len = Math.min(input.fields.length, 25);
		for (let i = 0; i < len; i++) {
			const field = input.fields[i];
			if(isArray(field))
				embed.fields.push({
					name: field[0],
					value: field[1],
					inline: field[2]
				});
		}
	}
	let channel = guild.channels.cache.get(req.body.channel);
	if(!channel)
		return res.sendStatus(404);
	channel.send({embed})
	.then(()=>res.sendStatus(200))
	.catch(()=>res.sendStatus(500));
});

module.exports = router;