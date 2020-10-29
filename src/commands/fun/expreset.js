const sqlite3 = require('sqlite3').verbose();

let expDB = new sqlite3.Database('./databases/database.db', (err) => {
	if (err) return console.error(err.message);
});

module.exports = {
	async run(message, args, colors) {
		let member =
			message.mentions.members.first() || (await message.guild.members.cache.get(args[1]));
		if (args[1]) {
			if (member) {
				expDB.run(
					`DELETE FROM exp WHERE guild = "${message.guild.id}" AND user = "${member.id}"`,
					(err) => {
						if (err) throw err;
					}
				);
				return message.channel.send('', {
					embed: {
						description: `EXP of ${member.user.tag} has been reset`,
						color: colors.negative,
					},
				});
			} else {
				return message.channel.send('', {
					embed: {
						description: `Invalid user mentioned. Please check that you mentions the correct user.`,
						color: colors.error,
					},
				});
			}
		} else {
			expDB.run(`DELETE FROM exp WHERE guild = "${message.guild.id}"`, (err) => {
				if (err) throw err;
			});
			return message.channel.send('', {
				embed: {
					description: `EXP of all users on the server has been reset.`,
					color: colors.negative,
				},
			});
		}
	},
	description: 'Resets all exp in guild.',
	detailed: 'Resets all exp in guild.',
	examples: (prefix) => `${prefix}expreset`,
	name: 'expreset',
	aliases: ['xpreset'],
	permissions: ['MANAGE_SERVER'],
	guildOnly: true,
};
