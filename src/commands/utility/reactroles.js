const config = require('../../../config.json');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/database.db', (err) => {
	if (err) return console.error(err.message);
});
db.run(`CREATE TABLE IF NOT EXISTS reactRoles(
	messageID TEXT NOT NULL,
	emojiID TEXT NOT NULL,
	roleID TEXT NOT NULL,
	channelID TEXT NOT NULL,
	guildID TEXT NOT NULL
);`);

module.exports = {
	run: async function (message, args, colors) {
		if (args[1] == undefined) {
			message.channel.send('', {
				embed: {
					color: 0xff0000,
					description: `Please follow the format ${config.prefix}reactrole add <messageID> <emojiID> <roleID> or ${config.prefix}reactrole remove <messageID> <emojiID>.`,
				},
			});
		}

		let messageId = args[2];
		let emojiId = args[3];
		let roleId = args[4];

		if (args[1] == 'add') {
			if (messageId == undefined || emojiId == undefined || roleId == undefined) {
				return message.channel.send('', {
					embed: {
						color: color.error,
						description: `Please follow the format ${config.prefix}reactrole add <messageID> <emojiID> <roleID>.`,
					},
				});
			}

			message.channel.messages
				.fetch(messageId)
				.then((msg) => {
					msg.react(emojiId);
				})
				.then(() => message.channel.send('Reaction role added'))
				.catch(() =>
					message.channel.send({
						embed: {
							color: color.error,
							description: `An error occurred ensure you used the right ids in the right order, \`${config.prefix}reactrole add <messageID> <emojiID> <roleID>\`.`,
						},
					})
				);

			db.run(
				'INSERT OR REPLACE INTO reactRoles(messageID, emojiID, roleID, guildID, channelID) VALUES ((?), (?), (?), (?), (?))',
				[messageId, emojiId, roleId, message.guild.id, message.channel.id]
			);
		}
		if (args[1] == 'remove') {
			if (args[2] == undefined || args[3] == undefined) {
				return message.channel.send({
					embed: {
						color: color.error,
						description: `Please follow the format ${config.prefix}reactrole remove <messageID> <emojiID>`,
					},
				});
			}
			message.channel.send('', {
				embed: {
					color: color.base,
					description: `Please follow the format ${config.prefix}reactrole remove <messageID> <emojiID>`,
				},
			});
		}
	},
	aliases: ['rr'],
	description: 'Add or remove a react role.',
	detailed: 'Add a react role to a message, or remove a react role from a message.',
	examples: (prefix) =>
		`${prefix}reactrole add <messageID> <emojiID> <roleID>, ${prefix}reactrole remove <messageID> <roleID>`,
	name: 'reactrole',
	permissions: ['MANAGE_ROLES'],
};
