import { Guild } from '../database';
import { Client } from '../core';

export = (client: Client): void => {
	client.on('ready', () => {
		console.log(`Logged in as ${client.user.tag} with the prefix ${client.prefix()}.`);
		client.guilds.cache.each((G) =>
			Guild.find({ id: G.id }, (err, guild) => {
				if (guild[0]) return;
				const g = new Guild({ id: G.id, customCommands: {} });
				g.save();
			})
		);
	});
};
