'use strict';
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./databases/handler.db', (err) => {
	if (err) {
		throw err;
	}
});

db.run('CREATE TABLE IF NOT EXISTS disabledCommands(guild TEXT NOT NULL, command TEXT NOT NULL)');

function toggle(message, command, disable){
	if(disable == undefined)
		db.get('SELECT * FROM disabledCommands WHERE guild = (?) AND command = (?)', [message.guild.id, command], (err, row)=> {
			if (err)
				throw(err);
			toggle(message, command, !row);
		});
	else if(disable)
		db.run('INSERT INTO disabledCommands(guild, command) VALUES((?), (?));', [message.guild.id, command], (err, row)=> {
			if (err)
				throw(err);
			message.channel.send(`\`Disabled ${command}\``);
		});
	else
		db.run('DELETE FROM disabledCommands WHERE guild = (?) AND command = (?);', [message.guild.id, command], (err, row)=> {
			if (err)
				throw(err);
			message.channel.send(`\`Enabled ${command}\``);
		});
}

module.exports = {
	run: async function (message, args){
		if(!args[1])
			return db.all('SELECT command FROM disabledCommands WHERE guild = (?)', [message.guild.id], (err, rows)=> {
				if (err)
					throw(err);
				let commands = '';
				if(rows && rows[0])
					rows.forEach(row=>{
						commands+=row.command+'\n';
					});
				else
					commands = '*none*';
				
				message.channel.send({
					embed: {
						title: `Disabled commands in ${message.guild.name}`,
						description: commands
					}
				});
			});
		if(!message.member.hasPermission('ADMINISTRATOR'))
			return message.channel.send('Only administrators may disable/enable commands.');
		let command = this.commandAliases[args[1].toLowerCase()];
		if(!command)
			return message.channel.send('`Command not found.`');

		if(command=='toggleCommand')
			return message.channel.send('`Operation not allowed, command can not be disabled.`');

		if(args[0]=='enable'||args[0]=='enableCommand')
			toggle(message, command, false);
		else if(args[0]=='disable'||args[0]=='disableCommand')
			toggle(message, command, true);
		else
			toggle(message, command);
	},
	description: 'Toggles commands within server',
	detailed: 'Toggles whether or not a command is available in a server. If called explicitly with enable/disable it will always enable or disable the given command according to the used keyword.',
	examples: prefix=>`${prefix}toggle [command], ${prefix}disable [command], ${prefix}enable [command]`,
	name: 'toggleCommand',
	aliases: ['disabledCommands', 'toggle', 'disable', 'enable', 'disableCommand', 'enableCommand'],
	perms: null,
}