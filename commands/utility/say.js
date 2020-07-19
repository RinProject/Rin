module.exports = {
    async run(message, args) {
        if (args[1] == undefined) {
            return message.channel.send('', {
                embed: {
                    description: 'Please provide a message for the bot to say.',
					color: 0xff0000
                }
            });
        }
	    
        message.delete().catch(e => e)
        return message.channel.send(args.splice(1).join(' '));
    },
    description: 'Says a given message.',
    detailed: 'Says a given message.',
    examples: prefix => `${prefix}say <message>`,
    name: 'say',
    perms: ['ADMINISTRATOR']
}
