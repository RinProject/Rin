module.exports = {
    async run (message, args, colors) {
        if (args[1] == undefined) {
            return message.channel.send('', {
                embed: {
                    description: 'Please mention a role to delete.',
                    color: colors.error
                }
            });
        }
        let role = message.mentions.roles.first() || message.guild.roles.cache.find(role => role.name === args[1]);
        if (!role) {
            return message.channel.send('', {
                embed: {
                    description: 'Please mention a role to delete.',
                    color: colors.error
                }
            });
        }
        role.delete().then(()=>{
			return message.channel.send('', {
				embed: {
					description: `Role successfully deleted.`,
					color: message.client.colors.success
				}
			});
		}).catch(e => {
			return message.channel.send('', {
				embed: {
					description: 'I am unable to remove this role. Please check this roles place in the role hierarchy.',
					color: colors.error
				}
			});
		});  
    },
    description: 'Deletes a role.',
	detailed: 'Deletes a given role.',
	examples: prefix => `${prefix}deleterole @rolename`,
	name: 'deleterole',
	permissions: ['MANAGE_ROLES'],
	botPermissions: ['MANAGE_ROLES'],
	guildOnly: true
}