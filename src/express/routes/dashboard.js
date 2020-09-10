const router = require('express').Router();
const fs = require('fs');
const dashboard = fs.readFileSync(__dirname+'/dashboard.html');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/database.db', (err) => {
	if(err)
		throw err;
});

const perms = require('../../handler/index').utils.permissionsFlags;

async function fetchPerms(guild, user){
	if(guild&&guild.members)
		return guild.members.cache.get(user).permissions.bitfield||0;
	else
		return 0;
}

const {run, get, all} = require('../../handler/index').utils.asyncDB;

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
	'embed',
	'custom',
	'json'
];

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

const { Prefix, commandUtils} = require('../../handler/index');

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
			let commands = await commandUtils.allDisabledIn(req.params.guild)||{}
			commands.forEach((c,i)=>commands[i] = c.command);
			res.send(JSON.stringify({
				name:guild.name.replace(/'/g, '\''),
				settings:{
					prefix: (await Prefix.get(req.params.guild)||{}).prefix||client.prefix(),
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
		case 'commands':
			if(!(userPerms&(perms.administrator|perms.manage_guild)))
				return res.sendStatus(404);
			res.send(JSON.stringify({name:guild.name, commands: await fetchCommands(req.params.guild)||null}));
			break;
		default:
			res.sendStatus(404);
	}
});

const logProperties = require('../../../JSONstorage/logProperties.json');
const logSQL = `UPDATE logs SET ${logProperties.join('=(?),')}=(?) WHERE guild=(?);`;

const { createCommand, processEmbed, fetchCommands, deleteCommand } = require('../../handler/index').customCommands;

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
			if(!req.body.prefix&&typeof(req.body.prefix)=='string')
				return res.sendStatus(400);
			Prefix.set(req.params.guild, req.body.prefix)
				.then(()=>res.sendStatus(200))
				.catch(()=>res.sendStatus(500));
			break;
		case 'command':
			if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild)){
				return res.sendStatus(403);
			}
			createCommand(req.body, req.params.guild)
			.then(()=>{
				res.sendStatus(200);
			}).catch(e=>{
				res.statusMessage = e;
				res.status(e==='Internal server error'?500:400).end();
			})
			break;
	}
});

router.post('/:guild/delete/command/', async(req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	if(!guild){
		return res.sendStatus(403);
	}
	if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild)){
		return res.sendStatus(403);
	}
	if(!(req.body.name&&typeof(req.body.name)=='string'))
		res.sendStatus(400);
	deleteCommand(req.params.guild, req.body.name)
		.then(()=>res.sendStatus(200))
		.catch(()=>res.sendStatus(500));
});

router.post('/:guild/send/embed/', async(req, res)=>{
	let guild = client.guilds.cache.get(req.params.guild);
	if(!req.user||!fetchPerms(guild, req.user.discordID)&(perms.administrator|perms.manage_guild))
		return res.sendStatus(403);

	if(!req.body)
		return res.sendStatus(400);

	const input = req.body;
	let embed = processEmbed(input);
	if(!(embed.title||embed.description||(embed.fields&&embed.fields[0])||(embed.thumbnail&&embed.thumbnail.url)||(embed.image&&embed.image.url)))
		return res.sendStatus(400);
	let channel = guild.channels.cache.get(req.body.channel);
	if(!channel)
		return res.sendStatus(404);
	channel.send({embed})
	.then(()=>res.sendStatus(200))
	.catch(()=>res.sendStatus(500));
});

module.exports = router;