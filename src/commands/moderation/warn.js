let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/database.db', (err) => {
	if(err)
		return console.error(err.message);
});

db.run(
`CREATE TABLE IF NOT EXISTS warnings(
	id TEXT NOT NULL,
	user TEXT NOT NULL,
	moderator TEXT NOT NULL,
	reason TEXT NOT NULL,
	guild TEXT NOT NULL,
	time TEXT NOT NULL,
	active INTEGER NOT NULL DEFAULT 1
);`
);

const sql = `INSERT INTO warnings(id, user, moderator, reason, guild, time) VALUES((?), (?), (?), (?), (?), (?));`
const crypto = require('crypto');
module.exports = {
	async run(message, args, colors) {
		let member = message.mentions.members.first()||await message.guild.members.cache.get(args[1]);
		let reason = args.slice(2).join(' ');
		if(reason&&member)
		{
			let timestamp = +new Date;
			let id = crypto.createHash('md5').update(timestamp.toString(16)).digest('hex').substring(22);
			db.run(sql, [id, member.id, message.author.id, reason, message.guild.id, timestamp.toString()], (err)=>{
				if(err)
					throw err;
				db.all(`SELECT modLogChannel FROM logs WHERE guild = "${message.guild.id}"`, (err, rows) =>{
					if (rows && rows[0] && rows[0]['modLogChannel']) {
						message.client.channels.cache.get(rows[0]['modLogChannel']).send({
							embed: {
								title: `${member.displayName} has been warned`,
								color: colors.negative,
								thumbnail: {
									url: member.user.displayAvatarURL()
								},
								description: `**Reason:** ${reason}`,
								fields: [
									{
										name: 'Moderator',
										value: `ID: ${message.author.id}\nName: ${message.author.tag}`,
										inline: true
									},
									{
										name: 'Warned',
										value: `ID: ${member.id}\nName: ${member.user.tag}`,
										inline: true
									}
								],
								footer: {
									text: `Warning id: ${id}`
								},
								timestamp: timestamp
							}
						});
					}
				});
				message.channel.send({
					embed: {
						title: `${member.user.tag} has been warned`,
						color: colors.negative,
						thumbnail: {
							url: member.user.displayAvatarURL()
						},
						description: `**Reason:** ${reason}`,
						footer: {
							text: `Warning id: ${id} | warned by ${message.author.tag}`,
							iconURL: message.author.displayAvatarURL()
						},
						timestamp: timestamp
					}
				});
			});
		}
		else if(args[1]=='remove' && args[2])
			db.run('UPDATE warnings SET active = 0 WHERE guild = (?) AND id = (?)', [message.guild.id, args[2]], (err)=>{
				if(err)
					return message.channel.send({
						embed: {
							title: 'An error occurred',
							description: 'Could not remove warning'+err
						}
					});
					message.channel.send({
						embed: {
							title: 'Warning removed',
							description: `Warning ${args[2]}`,
							color: colors.success,
						}
					});
				
			});
		else if(args[1]=='restore' && args[2])
			db.run('UPDATE warnings SET active = 1 WHERE guild = (?) AND id = (?)', [message.guild.id, args[2]], (err)=>{
				if(err)
					return message.channel.send({
						embed: {
							title: 'An error occurred',
							description: 'Could not remove warning'+err
						}
					});
					message.channel.send({
						embed: {
							title: 'Warning restored',
							description: `Warning: ${args[2]}`,
							color: colors.negative,
						}
					});
				
			});
		else
			message.channel.send({
				embed: {
					title: 'Incorrect command usage',
					description: `Correct syntax is:\n\`${this.examples}\``,
					color: colors.error,
				}
			});

	},
	description: 'Warns a user',
	detailed: 'Warns a user',
	examples: prefix => `${prefix}warn @Tarren#9722 Being a chuckle fuck\n${prefix}warn 571487483016118292 writing bad code\n${prefix}warn remove [id]\n${prefix}warn restore [id]`,
	name: 'warn',
	permissions: ['BAN_MEMBERS'],
	botPermissions: ['BAN_MEMBERS'],
	guildOnly: true
}
