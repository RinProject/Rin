module.exports = {
   async run (message, args) {

     // Check for bot permissions
     if (!message.guild.me.hasPermission('MANAGE_ROLES')) {
      return message.channel.send('', {
        embed: {
          title: `An error occured.`,
          description: "I need the ``manage roles`` permission to create roles.",
          color: 0xFF0000
        }
      });
    }

     if(!args[1]) return;
     message.member.guild.createRole({
       name: args[1],
       color: parseInt(args[2].replace('#',''), 16)||0x0000ff
     });
   },
   description: 'Creates a role',
   detailed: 'Creates a role: Takes in name and color',
   examples: prefix => `${prefix}createrole @rolename #hexcolor`,
   name: 'createrole',
   perms: ['MANAGE_ROLES']
}
