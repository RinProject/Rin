module.exports = {
    async run (message, args) {
      if (!args[1]) return;

      mesage.member.guild.createRole({
        name: args[1],
        color: parseInt(args[2].replace('#',''),16)
      });
    },
       description: 'Creates a role',
       detailed: 'Creates a role: Takes in name and color',
       examples: prefix => ${prefix}createrole @rolename #hexcolor,
       name: 'createrole',
       perms: ['MANAGE_ROLES']
}
