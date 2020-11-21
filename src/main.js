const coreLibraries = require('./core/');

//load config file
global.config = require('../config.json');
Object.keys(config.colors).forEach((key) => {
	config.colors[key] = parseInt(config.colors[key], 16);
});

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

process.env.RIN_MONGODB_HOST = config.mongoDBHost;

// load the events
require('./events/')(client);

// Connect to database
require('./database').connect();

client.login(config.token);
