module.exports = {
   async run (message, args) {
      if (args[1] == undefined) {
        return message.channel.send('', {
            embed: {
                "title":`Please follow the format: ${prefix}createrole @rolename #hexcolor`,
                "color": 0xFF0000
            }
        });
      } else if (args[2] == undefined) {
        return message.channel.send('', {
            embed: {
                "title":`Please follow the format: ${prefix}createrole @rolename #hexcolor`,
                "color": 0xFF0000
            }
        });
      } else {
          message.member.guild.createRole({
              name: args[1],
              color: parseInt(args[2].replace('#',''), 16)||0x0000ff
          });
          let role = message.guild.roles.find('name', args[1]);
          return message.channel.send('', {
              embed: {
                  "title": `Role ${role} created with the color ${args[2]}.`,
                  "color": args[2]
              }
          });
      }
   },
   description: 'Creates a role',
   detailed: 'Creates a role: Takes in name and color',
   examples: prefix => `${prefix}createrole @rolename #hexcolor`,
   name: 'createrole',
   perms: ['MANAGE_ROLES']
}
