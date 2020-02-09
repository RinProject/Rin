const Discord = require('discord.js');
const client = new Discord.Client();

//load config file
const config = (()=>{let configuration = require("./config.json"); configuration.directory = `${__dirname}\\${configuration.directory}`;return configuration})();

client.on('ready', () => {
	//print some information about the bot
	console.log(`logged in as ${client.user.username}#${client.user.discriminator} with ${client.guilds.array().length} guilds! Using the prefix ${config.prefix}`);
})

const handler = require('./handler');
handler.init(config);

client.on('message', message => {
	handler.handle(message);
});

client.login(config.token);