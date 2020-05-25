const Discord = require('discord.js');
const client = new Discord.Client();

//load config file
const config = (()=>{let configuration = require("./config.json"); configuration.directory = `${__dirname}\\${configuration.directory}`;return configuration})();
client.prefix = config.prefix;

client.on('ready', () => {
	//print some information about the bot
	console.log(`logged in as ${client.user.username}#${client.user.discriminator} with ${client.guilds.cache.array().length} guilds! Using the prefix ${config.prefix}`);
	handler.init(config, client);
})

const handler = require('./handler');

client.on('message', message => {
	handler.handler(message);
});

client.login(config.token);