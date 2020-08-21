'use strict';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/handler.db', (err) => {
	if (err) {
		throw err;
	}
});

db.run('CREATE TABLE IF NOT EXISTS prefixes(guild TEXT UNIQUE NOT NULL, prefix TEXT NOT NULL)');

module.exports = {
	run: async function (message, args) {
		if(!args[1])
			return db.get('SELECT prefix FROM prefixes WHERE guild = (?)', [message.guild.id], (err, row)=> {
				if (err)
					throw(err);
				message.channel.send(`Prefix is \`${row?row.prefix:client.prefix}\``);
			});
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return message.channel.send('Only administrators may change prefix!');
		if(args[1].toLowerCase()=='reset')
			db.run('DELETE FROM prefixes WHERE guild = (?);', [message.guild.id], (err) => {
				if(err)
					return message.channel.send('`Database error, failed to change prefix`');
				message.channel.send(`Prefix reset and is now to \`${client.prefix}\`.`);
			});
		else
			db.run('INSERT OR REPLACE INTO prefixes(guild, prefix) VALUES((?), (?));', [message.guild.id, args[1].toLowerCase()], (err) => {
				if(err)
					return message.channel.send('`Database error, failed to change prefix`');
				message.channel.send(`Prefix changed to \`${args[1].toLowerCase()}\`.`);
			});
	},
	description: 'Changes prefix',
	detailed: 'Changes prefix in a given guild',
	examples: prefix => `${prefix}prefix ?:, ${prefix}prefix reset`,
	name: 'prefix',
	perms: null,
	guildOnly: true
};
