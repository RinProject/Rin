module.exports = {
    async run(message) {
        const args = message.content.split(' ');
        if (args.length == 1){
            message.channel.fetchMessage({limit: 10}).then(message => {
                message.channel.bulkDelete(messages);
            })
        } else {
            return message.channel.fetchMessages({ limit: amount + 1 }).then(messages => {
                      message.channel.bulkDelete(messages);
            });
        }
    }
    description: 'Purges Messages',
  	detailed: 'Purges Messages',
  	examples: prefix => `${prefix}purge <number of message to delete>`,
  	name: 'purge',
  	perms: [`MANAGE_MESSAGES`]
}
