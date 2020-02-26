module.exports = {
    async run(message) {
        const args = message.content.split(' ');
        if (args.length == 1){
            message.channel.fetchMessage({limit: 2}).then(messages => {
                message.channel.bulkDelete(messages);
            })
        } else {
            const num = parseInt(args[1]);
            if (num > 100) {
              message.channel.send('', {
                embed: {
                  title: 'Please Enter a Smaller Number',
                  color: 0xFF0000
                }
              });
            } else {
                return message.channel.fetchMessages({limit: num + 1}).then(messages => {
                    message.channel.bulkDelete(messages);
                });
            }
        }
    },
    description: 'Purges Messages',
  	detailed: 'Purges Messages',
  	examples: prefix => `${prefix}purge <number of message to delete>`,
  	name: 'purge',
  	perms: [`MANAGE_MESSAGES`]
}
