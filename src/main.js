const coreLibraries = require('./handler/');
const sqlite3DB = require('sqlite3').verbose();
const client = new coreLibraries.Client({
	disableMentions: 'everyone',
	partials: ['MESSAGE', 'REACTION'],

	directory: `${__dirname}/commands`,
	enableCustomCommands: config.enableCustomCommands,
	owners: config.owners,
	prefix: config.prefix,
	logChannel: config.logChannel,
	categories: true,
	colors: config.colors,
});

global.client = client;

global.db = new sqlite3DB.Database('./databases/database.db', (err) => {
	if (err) return console.error(err.message);
});

//load config file
global.config = require('../config.json');
Object.keys(config.colors).forEach((key) => {
	config.colors[key] = parseInt(config.colors[key], 16);
});

// load the events
require('./events/')(client);

client.login(config.token);
