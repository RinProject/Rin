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

let messageId;
let emojiId;
let roleId; 

module.exports = {
    run: async function (message, args) {
        if (args[1] == undefined) {
            message.channel.send('', {
                embed: {
                    color: 0xFF0000,
                    description: `Please follow the format ${config.prefix}reactrole add <messageid> <emojiid> <roleid> or ${config.prefix}reactrole remove <messageid> <emojiid>.`
                }
            })
        } 
        if (args[1] == 'add') {
            if (args[2] == undefined || args[3] == undefined || args[4] == undefined) {
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: `Please follow the format ${config.prefix}reactrole add <messageid> <emojiid> <roleid>.`
                    }
                });
            } else {
                messageId = message.guild.fetch(args[2]);
                emojiId = message.guild.emojis.resolveID(args[3]);
                roleId = message.guild.roles.fetch(args[4]);
            }
            if (messageId.guild.id != message.guild.id) {
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: "You can only add a react role to messages in this server."
                    }
                });
            } else if (emojiId.guild.id != message.guild.id) {
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: "You can only use emojis that are in this server."
                    }
                });
            } else if (roleId.guild.id != message.guild.id) {
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: "You can only add a react role with a role that is in this server."
                    }
                });
            } else { 
                db.run(`INSERT OR REPLACE INTO reactroles(messageid, emojiid, roleid) VALUES (${messageId}, ${emojiId}, ${roleId})`);
                db.all(`SELECT * FROM reactroles WHERE messageid = ${messageId} AND emojiid = ${emojiId} AND roleid = ${roleId}`, (err, rows) => {
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