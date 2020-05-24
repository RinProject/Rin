module.exports = {
    async run(message) {

      // Check for sufficent permissions
      if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
        return message.channel.send('I need the ``manage messages`` permission to purge messages.');
      }

        const args = message.content.split(' ');
        if (args.length == 1){
            message.channel.fetchMessage({limit: 2}).then(messages => {
                message.channel.bulkDelete(messages);
            })
        } else {
            const num = parseInt(args[1]);
            if (num > 99) {
              message.channel.send('', {
                embed: {
                  title: 'Please enter a smaller number.',
                  color: 0xFF0000
                }
              });
            } else {
                return message.channel.fetchMessages({limit: num + 1}).then(messages => {
                    message.channel.bulkDelete(messages,true);
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
