import { Guild } from '../database';
import { Client } from '../core';

export = (client: Client): void => {
	client.on('guildCreate', (guild) =>
		Guild.find({ id: guild.id }, (err, guilds) => {
			if (guilds[0]) return;
			const g = new Guild({ id: guild.id });
			g.save();
		})
	);
};
