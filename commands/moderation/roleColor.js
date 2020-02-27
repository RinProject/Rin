module.exports = {
  async run (message, args) {
    role = message.guild.roles.find('name', 'Shinobu')

  /*  message.member.colorRole.edit({                                                                                                // edit the color role
                    color: finalA                                                                                                                  // set color to the random generated one
                })*/
    message.member.colorRole.edit({
            color: parseInt(args[2].replace('#',''), 16)||0x0000ff,
    })
  },
  description: 'Changes a Roles Color',
  detailed: 'Changes the color of a preexisting role',
  examples: prefix => `${prefix}rolecolor @rolename #hexcolor`,
  name: 'rolecolor',
  perms: ['MANAGE_ROLES']
}
