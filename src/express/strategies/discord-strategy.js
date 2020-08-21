const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/users.db', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to users.db.');
});

db.run('CREATE TABLE IF NOT EXISTS users(discordID TEXT UNIQUE NOT NULL, token TEXT UNIQUE NOT NULL, guilds TEXT DEFAULT "");');

const config = require('../../../config.json');

passport.serializeUser((user, done) => {
	//console.log(user.id, user.guilds.length, user.accessToken)
	done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
	db.get(`SELECT * FROM users WHERE discordID = ${id};`, (err, user)=>{
		if(err)
			console.log(err);
		else{
			user.guilds = JSON.parse(user.guilds||'{}');
			done(null, user);
		}
	});
});

passport.use(new DiscordStrategy({
	clientID: config.clientID,
	clientSecret: config.clientSecret,
	callbackURL: config.redirect,
	scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
	const sql = `INSERT OR REPLACE INTO users(discordID, token, guilds) VALUES ('${profile.id}', '${profile.accessToken}', '${JSON.stringify(profile.guilds).replace(/'/g, "''") || ''}');`;
	db.run(
		sql,
		(err) => {
			if (err)
				throw err;
			done(null, {
				token: profile.accessToken,
				id: profile.id,
				guilds: JSON.stringify(profile.guilds) || ''
			});
		}
	);
}));