import { Client } from '../core';
import { Guild } from '../database';

export = (client: Client): void => {
	client.on('messageReactionAdd', async (reaction, user) => {
		const g = await Guild.findOne({ id: reaction.message.guild.id });

		if (reaction.partial)
			try {
				reaction.fetch();
			} catch (e) {
				client.reportError(e);
				return;
			}

		const role = g.reactionRoles.get(reaction.message.id + reaction.emoji.id);

		if (role)
			reaction.message.guild.members
				.resolve(user.id)
				.roles.add(role, `User reacted to ${reaction.message.url}`);
	});
};
