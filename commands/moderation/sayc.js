module.exports = {
    async run(message, args) {
        const content = message.content.slice(' '); 
        const channel = message.mentions.channels.first();
        if (!channel || args[1] != channel) {
            return message.channel.send('', {
                embed: {
                    description: 'Please provide a channel and message for the bot to say.',
                    color: 0xff0000
                }
            });
        }
        if (args[1] == undefined || args[2] == undefined) {
            return message.channel.send('', {
                embed: {
                    description: 'Please provide a channel and message for the bot to say.',
					color: 0xff0000
                }
            });
        }
        return channel.send(args.splice(2).join(' '));
    },
    description: 'Says a given message in a given channel.',
    detailed: 'Says a given message in a given channel.',
    examples: prefix => `${prefix}say #channel <message>`,
    name: 'sayc',
    perms: ['MANAGE_SERVER']
}