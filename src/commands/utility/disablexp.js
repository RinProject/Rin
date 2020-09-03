const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/database.db', (err) => {
	if (err)
		return console.error(err.message);
});

db.run('CREATE TABLE IF NOT EXISTS expRole(guild TEXT UNIQUE NOT NULL, role TEXT NOT NULL);');

const { run, get } = require('../../utils').asyncDB;

module.exports = {
	async run(message, args) {
		let member = message.mentions.members.first() || await message.guild.members.fetch(`${args[1]}`)

		if (args[1] == undefined || !member)
			return message.channel.send({
				embed: {
					title: 'Incorrect command usage',
					description: 'Please provide a user to disable the exp of.',
					color: colors.error
				}
			});

		let role = message.guild.roles.resolve((await get(db, 'SELECT role FROM expRole WHERE guild = (?);', [message.guild.id])||{}).role);
		if (!role){
			role = await message.member.guild.roles.create({
				data: {
					name: 'no exp',
					color: 0x000000
				},
				reason: 'User has had their exp gain disabled.'
			});
			await run(db, 'INSERT OR REPLACE INTO expRole(guild, role) VALUES((?), (?));', [message.guild.id, role.id]);
		}
			
		member.roles.add(role).then(() => 
			message.channel.send({
				embed: {
					description: `${member.toString()} has had their exp gain disabled.`,
					color: role.color || colors.base
			}})
		).catch(() => 
			message.channel.send({
				embed: {
					description: 'Unable to add role to user.',
					color: colors.error
			}})
		);
	},
	description: 'Disables exp gain on a user.',
	detailed: 'Disables esp gain on a user.',
	examples: prefix => `${prefix}disableexp @Soze#0040`,
	name: 'disableExp',
	aliases: ['disableXp', 'noExp', 'noXp'],
	perms: ['MANAGE_SERVER'],
	botPerms: ['MANAGE_ROLES'],
	guildOnly: true
}