let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/warnings.db', (err) => {
	if(err)
		return console.error(err.message);
});

let logDB = new sqlite3.Database('./databases/logs.db', (err) => {
	if(err)
		return console.error(err.message);
});

const options = require('../../JSONStorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);
module.exports = {
	async run(message, args) {
		if(args[1]){
			let member = message.mentions.members.first()||await message.guild.members.cache.get(args[1]);
			if(member)
				db.all(`SELECT reason, id, time, active, moderator FROM warnings WHERE guild = ${message.guild.id} AND user = ${member.id}`, (err, rows)=>{
					if(err)
						return message.channel.send({
							embed: {
								title: 'An error has occurred',
								description: 'Fetching warnings caused an internal error'
							}
						});
					if(!rows)
						return message.channel.send({
							embed: {
								title: 'No warnings found',
								description: 'It seems the provided user has no warnings'
							}
					});
					let fields = [];
					let warnings = 0;
					rows.forEach((row, i)=>{
						let moderator = message.guild.members.cache.get(row.moderator).toString()||row.moderator;
						fields.push({
							name: `Warning number ${i+1}${row.active?'':' (redacted warning)'}`,
							value: `**Reason:** ${row.reason}\n**Warning id:** ${row.id}\n**Moderator**: ${moderator}\n**Timestamp:** ${formatter.format(row.time)}`,
							inline: false
						});
						if(row.active)
							++warnings;
					});
					message.channel.send({
						embed: {
							title: `${member.displayName} has ${warnings} active warning${warnings===1?'':'s'}`,
							thumbnail: {
								url: member.user.displayAvatarURL()
							},
							description: member.user.toString(),
							fields: fields
						}
					});
				});
			else
				db.get('SELECT * FROM warnings WHERE guild = (?) AND id = (?)', [message.guild.id, args[1]], (err, row)=>{
					if(err)
						return message.channel.send({
							embed: {
								title: 'An error has occurred',
								description: 'Fetching warnings caused an internal error'+err
							}
						});
					if(!row)
						return message.channel.send({
							embed: {
								title: 'No warning found',
								description: 'It seems the provided user has no warnings'
							}
					});
					let member = message.guild.members.cache.get(row.user);
					let moderator = message.guild.members.cache.get(row.moderator);
					message.channel.send({
						embed: {
							title: `${member.displayName} has been warned`,
							thumbnail: {
								url: member.user.displayAvatarURL()
							},
							description: `**Reason:** ${row.reason}`,
							fields: [
								{
									name: 'Moderator',
									value: `ID: ${moderator.id}\nName: ${moderator.user.tag}`,
									inline: true
								},
								{
									name: 'Warned',
									value: `ID: ${member.id}\nName: ${member.user.tag}`,
									inline: true
								}
							],
							footer: {
								text: `Warning id: ${member.id}`
							},
							timestamp: parseInt(row.time)
						}
					});
				});
		}
	},
	aliases: ['warning'],
	description: 'Displays warnings and their ids of a user, or a specific warning',
	detailed: 'Warns a user',
	examples: prefix => `${prefix}warnings @Tarren#9722\n${prefix}warnings 157101769858613248\n${prefix}warning [id]`,
	name: 'warnings',
	perms: ['BAN_MEMBERS'],
	botPerms: ['BAN_MEMBERS'],
	guildOnly: true
}
