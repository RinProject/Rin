module.exports = {
    async run(message, args) {
		let failed = 0;
        if (args[1] == undefined) {
            message.channel.send({
                embed: {
                    title: 'Please provide users to ban.',
                    color: colors.error
                }
            });
        }
        for (var i = 1; i < args.length; i++) {
            let user = await message.client.users.fetch(args[i]).catch(e => {});
            if(user) {
                await message.guild.members.ban(user, {days: 0}).catch(e => {
                    message.channel.send({ embed: {
                        title: `I am unable to ban ${user.tag}(${user.id}).`,
                        color: colors.error
                    }});
					failed++;
				});
            } else {
                message.channel.send({ embed: {
                    title: `${args[i]} is not a valid user.`,
                    color: colors.error
				}});
				failed++;
			}
		}
        return message.channel.send({ embed: {
            description: `${args.length-1-failed} user(s) banned`,
            color: colors.negative
        }});
    },
    description: 'Bans all mentioned users',
    detailed: 'Bans all mentioned users',
    examples: prefix => `${prefix}massban <id> <id> <id>`,
    name: 'massban',
    perms: ['BAN_MEMBERS'],
    botPerms: ['BAN_MEMBERS'],
    guildOnly: true
}
