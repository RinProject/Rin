const config = require('../../../config.json')
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./databases/reactroles.db', (err) => {
	if(err) {
		return console.error(err.message);
	}
	console.log('Connected to reactroles.db.');
});
db.run(`CREATE TABLE IF NOT EXISTS reactroles(
    guild TEXT NOT NULL,
    messageid TEXT NOT NULL,
    emojiid TEXT NOT NULL,
    roleid TEXT NOT NULL,
    messagechannelid TEXT NOT NULL
);`);

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
        
        // ID variables (essentially arguments) put in by user, used for later
        let messageId = args[2];
        let emojiId = args[3];
        let roleId = args[4];

        if (args[1] == 'add') {
            if (messageId == undefined || emojiId == undefined || roleId == undefined) {
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: `Please follow the format ${config.prefix}reactrole add <messageid> <emojiid> <roleid>.`
                    }
                });
            } 

            // Reacts to given message
            message.channel.messages.fetch(messageId).then(m => {m.react(emojiId)});
            
            // Does database things
                db.run(`INSERT OR REPLACE INTO reactroles(messageid, emojiid, roleid, guild, messagechannelid) VALUES (${messageId}, ${emojiId}, ${roleId}, ${message.guild.id}, ${message.channel.id})`);
                db.all(`SELECT * FROM reactroles WHERE messageid = ${messageId} AND emojiid = ${emojiId} AND roleid = ${roleId}`, (err, rows) => {
                    if(err)
                        console.log(err);  
                });
            
        } 
        if (args[1] == 'remove') {
            if (args[2] == undefined || args[3] == undefined){
                return message.channel.send('', {
                    embed: {
                        color: 0xFF0000,
                        description: `Please follow the format ${config.prefix}reactrole remove <messageid> <emojiid>`
                    }
                })
            }
            message.channel.messages.fetch(messageId).then(m => {m.remove(args[3])});
        }
    },
    aliases: ['rr'],
    description: 'Add or remove a react role.',
    detailed: 'Add a react role to a message, or remove a react role from a message.',
    examples: prefix => `${prefix}reactrole add <messageid> <emojiid> <roleid>, ${prefix}reactrole remove <messageid> <roleid>`,
    name: 'reactrole',
    perms: ['MANAGE_ROLES']
}
