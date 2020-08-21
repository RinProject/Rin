const config = require('../../../config.json')

module.exports = {
    async run(message, args) {
        let member = message.mentions.members.first() || await message.guild.members.cache.get(args[1])
        let role = message.mentions.roles.first() || await message.guild.roles.cache.get(args[2])

        if (!role || !member) {
            return handleError();
        }

        if (message.guild.me.roles.highest.position < role.position)
        {
            return message.channel.send('', {
                embed: {
                    description: `I am unable to remove the requested role. Please check my position in the role hierarchy.`,
                    color: 0xFF0000
                }
            });
        }
        member.roles.remove(role).then(() => {
            message.channel.send('', {
                embed: {
                    description: `${member.toString()} has had the role ${role.toString()} removed.`,
                    color: role.color
                }
            });
        });

        function handleError(e) {
            return message.channel.send('', {
                embed: {
                    description: `Please follow the format ${message.client.prefix}removerole @user @role.`,
                    color: 0xFF0000
                }
            });
        }
    },
description: 'Removes a role from a user.',
detailed: 'Removes a role from a user.',
examples: prefix => `${prefix}removerole @user @role`,
name: 'removerole',
perms: ['MANAGE_ROLES']
}
