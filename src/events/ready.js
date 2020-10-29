const { config } = require('process');

module.exports = (client) => {
	client.on('ready', () => {
		console.log(`Logged in as ${client.user.username}#${client.user.discriminator}.`);

		if (config.enableWeb)
			require('./web')({
				port: config.port,
				clientSecret: config.clientSecret,
			});
	});
};
