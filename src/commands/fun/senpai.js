let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/database.db', (err) => {
	if(err)
		return console.error(err.message);
});
db.run(`CREATE TABLE IF NOT EXISTS senpais(kouhai TEXT UNIQUE NOT NULL, senpai TEXT NOT NULL);`);
module.exports = {
	run: async function (message, args) {
		if(args[1] && args[1].startsWith('del'))
			return db.run(`DELETE FROM senpais WHERE kouhai = ${message.author.id};`), message.channel.send('', { embed: { color: 0xff0000, title: 'Senpai cleared' } });
		if(message.mentions.users.first())
			db.run(`INSERT OR REPLACE INTO senpais(kouhai, senpai) VALUES (${message.author.id}, ${message.mentions.users.first().id})`), message.channel.send('Senpai set');
		else
			db.all(`SELECT senpai FROM senpais WHERE kouhai = ${message.author.id}`, (err, rows) => {
				if(err)
					console.log(err);
				else
					if(rows[0])
						message.channel.send('', { embed: { color: colors.base, title: `Your senpai is ${message.client.users.cache.get(rows[0].senpai).username || rows[0].senpai}` } });
					else
						message.channel.send('', { embed: { color: colors.error, title: 'You have no senpai!' } });
			});
	},
	description: 'Sets, clears, and displays your senpai',
	detailed: 'Lets you set, display, modify, and clear your senpai to your hearts content',
	examples: prefix => `${prefix}senpai @someone, ${prefix}senpai del, ${prefix}senpai`,
	name: 'senpai'
};