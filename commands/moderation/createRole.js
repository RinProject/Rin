module.exports = {
   async run (message) {
     const args = message.content.slice(1).split(' ');
     const command = args.shift().toLowerCase();
     const x = 0000FF;

     const color = message.content.slice(x.length).split(' ')
     message.member.guild.createRole({
       name: `${x}`,
       color: 0x`${color}`
     });
   },
   description: 'Creates a role',
   detailed: 'Creates a role: Takes in name and color',
   examples: prefix => `${prefix}createrole @rolename #hexcolor`,
   name: 'createrole',
   perms: ['MANAGE_ROLES']
}
