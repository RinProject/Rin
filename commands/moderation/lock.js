module.exports = {
    async run (message) {
      const everyone = message.guild.defaultRole.id;0
      if (message.content.split(' ')[1] != 'off') {
        message.channel.overwritePermissions(everyone, {
          'SEND_MESSAGES': false
        }).then(channel => {
          message.channel.send('', {
            embed: {
              title: 'Channel Locked',
              color: 0xFF0000
            }
          });
        });
      } else {
        if (message.content.split(' ')[1] == 'off') {
          message.channel.overwritePermissions(everyone, {
            'SEND_MESSAGES': true
          }).then(channel => {
            message.channel.send('', {
              embed: {
                title: 'Channel Unlocked',
                color: 0x00FF00
              }
            });
          });
        }
      }
    },
    description: 'Locks a channel',
    detailed: 'Overwrites permissions to speak in channel it is called in',
    examples: prefix => `${prefix} lock, prefix => $prefix} lock off`,
    name: `lock`,
    perms: ['MANAGE_ROLES']
}
