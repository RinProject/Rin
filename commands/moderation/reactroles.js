const config = require('../../config.json')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/reactroles.db', (err) => {
	if(err) {
		return console.error(err.message);
	}
	console.log('Connected to reactroles.db.');
});
db.run(`CREATE TABLE IF NOT EXISTS reactroles(
    messageid TEXT NOT NULL,
    emojiid TEXT NOT NULL,
    roleid TEXT NOT NULL
);`);

module.exports = {
    run: async function (message, args) {
        if (args[1] == undefined) {
            message.channel.send('', {
                embed: {
                    color: 0xFF0000,
                    description: `Please follow the format ${config.prefix}reactrole add <messageid> <emojiid> <roleid> or ${config.prefix}reactrole remove <messageid> <emojiid>`
                }
            })
        } 
        if (args[1] == 'add') {
            let messageId = message.guild.roles.fetch(args[2]);
            let emojiId = message.guild.roles.fetch(args[3]);
            let roleId = message.guild.roles.fetch(args[4]);
            if (messageId == undefined || emojiId == undefined || roleId == undefined) {
                message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: `Please follow the format ${config.prefix}reactrole add <messageid> <emojiid> <roleid>`
                    }
                });
            } else { 
                db.run(`INSERT OR REPLACE INTO reactroles(messageid, emojiid, roleid) VALUES (${args[2]}, ${args[3]}, ${args[4]})`);
                db.all(`SELECT * FROM WHERE messageid = ${args[2]} AND emojiid = ${args[3]} AND roleid = ${args[4]}}`, (err, rows) => {
                    if(err)
                        console.log(err);
                });
            }
        } 
        if (args[1] == 'remove') {
            if (args[2] == undefined || args[3] == undefined){
                message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: `Please follow the format ${config.prefix}reactrole remove <messageid> <roleid>`
                    }
                })
            }
        }
    },
    aliases: ['rr'],
    description: 'Add or remove a react role.',
    detailed: 'Add a react role to a message, or remove a react role from a message.',
    examples: prefix => `${prefix}reactrole add <messageid> <emojiid> <roleid>, ${prefix}reactrole remove <messageid> <roleid>`,
    name: 'reactrole',
    perms: ['MANAGE_ROLES']
}