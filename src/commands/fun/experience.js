const sqlite3 = require('sqlite3').verbose();

let expDB = new sqlite3.Database('./databases/database.db', (err) => {
	if(err)
		return console.error(err.message);
});

expDB.run('CREATE TABLE IF NOT EXISTS exp(user TEXT NOT NULL, exp INTEGER DEFAULT 0 NOT NULL, guild TEXT NOT NULL, lastMessage INTEGER DEFAULT 0 NOT NULL);')

module.exports = {
	async run(message, args, colors) {
		if(args[1]&&args[1].toLowerCase()=='top')
			expDB.all(`SELECT exp, user FROM exp WHERE guild = (?) ORDER BY exp DESC LIMIT 0, 10;`, [message.guild.id], (err, rows)=>{
				if(err)
					throw err;
				let leaderboard = '';
				rows.forEach((row, index)=>{
					let name = message.guild.members.cache.get(row.user).displayName;
					leaderboard+=`**# ${index+1} ${name}**\nLevel: \`${row.exp}\`\nExp: \`${row.exp}\`\n\n`
				});
				leaderboard = leaderboard?leaderboard.substr(0, leaderboard.length-2):'**None**';
				message.channel.send({
					embed: {
						author:{
							name: 'Leaderboard'
						},
						thumbnail: {
							url: message.guild.iconURL({
								format: "png",
								dynamic: true
							})
						},
						title: message.guild.name,
						description: leaderboard,
						color: colors.base
					}
				});	
			});
		else
			expDB.get('SELECT exp FROM exp WHERE user = (?) AND guild = (?);', [(message.mentions.users.first()||{}).id||message.author.id, message.guild.id], (err, row)=>{
				if(err)
					throw err;
				message.channel.send('', {
					embed: {
						description: `Your exp is: ${row?row.exp:'none'}`,
						color: colors.base
					}
				});	
			});
	},
	description: 'Displays users exp, can also display top exp in guild.',
	detailed: 'Displays users exp, can also display top exp in guild.',
	examples: prefix => `${prefix}exp, ${prefix}exp top, ${prefix}exp top 2`,
	name: 'experience',
	aliases: ['exp', 'xp'],
	guildOnly: true
}
