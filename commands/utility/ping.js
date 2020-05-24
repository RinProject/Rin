module.exports = {
    async run(message) {
        let ping = message.createdTimestamp - Date.now();
        return message.channel.send('', {
            embed: {
                title: `${ping}ms`,
                color: 0xFF80CC
            }
        });
    },
    description: 'Provides the bots ping',
	detailed: 'Provides the bots ping',
	examples: prefix => `${prefix}ping`,
	name: 'ping',
	perms: [null]
}