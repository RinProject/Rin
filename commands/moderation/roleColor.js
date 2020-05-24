module.exports = {
  async run (message, args) {
    if (args[1] == undefined){
        return message.channel.send('', {
          embed: {
            "title":"Please enter a role, followed by a color.",
            "color":0xFF0000
          }
        });
    } else if (args[2] == undefined){
      return message.channel.send('', {
        embed: {
          "title":"Please enter a role, followed by a color.",
          "color":0xFF0000
        }
      });
    } else {
    let role = message.guild.roles.find('name', args[1]);
      role.edit({
              color: args[2]
      });
      return message.channel.send('', {
        embed: {
            "title": `Role ${args[1]} color changed to ${args[2]}`,
            "color": args[2]
        }
      });
    }
  },
  description: 'Changes a Roles Color',
  detailed: 'Changes the color of a preexisting role',
  examples: prefix => `${prefix}rolecolor @rolename #hexcolor`,
  name: 'rolecolor',
  perms: ['MANAGE_ROLES']
}
