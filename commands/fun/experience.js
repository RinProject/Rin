const sqlite3 = require('sqlite3').verbose();

let expDB = new sqlite3.Database('./exp.db', (err) => {
	if(err) {
		return console.error(err.message);
	}
	console.log('Connected to exp.db.');
});

module.exports = {
	async run(message, args) {
		if(args[1]&&args[1].toLowerCase()=='top')
			expDB.all(`SELECT exp, user FROM exp${message.guild.id} ORDER BY exp DESC LIMIT 0, 10;`, [], (err, rows)=>{
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
						color: 0xFF80CC
					}
				});	
			});
		else
			expDB.get(`SELECT exp FROM exp${message.guild.id} WHERE user = ${message.author.id}`, [], (err, row)=>{
				if(err)
					throw err;
				message.channel.send('', {
					embed: {
						description: `Your exp is: ${row?row.exp:'none'}`,
						color: 0xFF80CC
					}
				});	
			});
	},
	description: 'Displays users exp, can also display top exp in guild.',
	detailed: 'Displays users exp, can also display top exp in guild.',
	examples: prefix => `${prefix}exp, ${prefix}exp top, ${prefix}exp top 2`,
	name: 'experience',
	aliases: ['exp', 'xp'],
	perms: null,
	guildOnly: true
}
