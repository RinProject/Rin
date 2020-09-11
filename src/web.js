/**
 * 
 * @param {object} config
 * @param {string} [config.port] //port for server to run on
 * @param {string} config.clientSecret //discord, client secret
 */

module.exports = function(config){
	const express = require('express');
	const app = express();
	const port = config.port || 1337;
	const session = require('express-session');
	let SQLiteStore = require('connect-sqlite3')(session);
	const passport = require('passport');
	const strategy = require('./express/strategies/discord-strategy.js');
	const crypto = require('crypto');
	let sum = crypto.createHash('sha256');
	sum.update(config.clientSecret);

	const fs = require('fs');
	const base = fs.readFileSync(__dirname+'/express/index.html').toString();
	const baseError = fs.readFileSync(__dirname+'/express/error.html').toString();
	const sqlite3 = require('sqlite3').verbose();

	let db = new sqlite3.Database('./databases/database.db', (err) => {
		if (err)
			return console.error(err.message);
	});

	app.engine('html', function (path, options, callback){
		if(path.endsWith('error.html')){
			let rendered = baseError
				.replace('#auth#', options.req.user?'auth/logout':'auth')
				.replace('#login#', options.req.user?'Logout':'Login')
				.replace(/#title#/g, options.title)
				.replace('#content#', options.content);
			return callback(null, rendered)	
		}
		let rendered = base
			.replace('#auth#', options.req.user?'auth/logout':'auth')
			.replace('#login#', options.req.user?'Logout':'Login')
			.replace('#title#', options.title)
			.replace('#content#', options.content);
		return callback(null, rendered)
	})
	app.set('views', __dirname+'/express');
	app.set('view engine', 'html');
	app.use(session({
		secret: sum.digest('hex'),
		cookie: {
			maxAge: 60000 * 60 * 24 * 14
		},
		saveUninitialized: false,
		store: new SQLiteStore({
			dir: './databases/',
			db: 'express.db'
		}),
		resave: false,
		name: 'discord'
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	app.use(express.static(__dirname+'/express/public'))

	const bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	const home = fs.readFileSync(__dirname+'/express/home.html').toString()
	.replace('#invite#', `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
	.replace('#avatar#', `<img src="${client.user.avatarURL({size: 1024})}">`);

	app.get('/', (req, res) => {
		res.render('index', {req, content: home, title: 'Home - Rin'});
	});
	const converter = new (require('showdown')).Converter({ghCompatibleHeaderId: true, extensions:[require('showdown-highlight')]});
	const docs = converter.makeHtml(fs.readFileSync('./docs/custom_commands.md').toString());
	app.get('/docs/', (req, res) => {
		res.render('index', {req, content: docs, title: 'Custom command docs'});
	});
	const highlight = fs.readFileSync('./node_modules/highlight.js/styles/vs2015.css').toString()//.replace(/\n\./g, '.').replace(/\n  /g, '').replace(/\n\n/g,'').replace(/\n\}/g, '}').replace(/\n\./g, '.').replace('/.', '/\n.');
	app.get('/highlight.css', (req, res) => {
		res.send(highlight);
	});

	app.use('/auth', require('./express/routes/auth.js'));

	app.use('/dashboard', require('./express/routes/dashboard.js'));

	app.use('/commands', require('./express/routes/commands.js'));

	app.get('/leaderboard/:guild/:page?', (req, res) => {
		if (req.params.guild) {
			let page = req.params.page || 1;
			db.all(`SELECT exp, user FROM exp WHERE guild = (?) ORDER BY exp DESC LIMIT ${0 * page}, ${10 * page - 1};`, [req.params.guild], (err, rows) => {
				if (err)
					return res.render('error', {req: req, title: '500', content: 'Internal server error'});
				if(!rows)
					return res.render('error', {req: req, title: '404', content: 'Not found'});
				let guild = client.guilds.cache.get(req.params.guild);
				let leaderboard = '';
				rows.forEach((row, index) => {
					let name = guild.members.cache.get(row.user).user.tag;
					leaderboard += `<div><h1># ${index + 1 + 10 * (page - 1)} ${name}</h1><h2>Exp: ${row.exp}</h2></div>`
					//leaderboard += `<div><h1># ${index + 1 + 10 * (page - 1)} ${name}</h1><h2>Level: ${row.exp}</h2><h2>Exp: ${row.exp}</h2></div>`
				});
				if (!leaderboard)
					return res.render('error', {req: req, title: '404', content: 'Not found'});
				res.render('index', {req: req, content: leaderboard, title: 'Leaderboard' + guild.name});
			});
		}
	});

	app.use(function(req, res, next){
		res.status(404);
		if(req.accepts('html'))
			res.render('error', {req: req, title: '404', content: 'Not found'});
		else if(req.accepts('json'))
			res.send({ error: 'Not found' });
		else
			res.type('txt').send('Not found');
	});

	app.use(function(req, res, next){
		res.status(403);
		if(req.accepts('html'))
			res.render('error', {req: req, title: '403', content: 'Resource inaccessible'});
		else if(req.accepts('json'))
			res.send({ error: 'Not found' });
		else
			res.type('txt').send('Not found');
	});

	app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
	return app;
};