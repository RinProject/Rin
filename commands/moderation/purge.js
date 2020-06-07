module.exports = {
	async run(message, args) {

		// Check for sufficent permissions
		if(!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
			return message.channel.send('', {
				embed: {
					title: "Insufficient permissions.",
					description: 'I need the ``manage messages`` permission to purge messages.',
					color: 0xFF0000
				}
			});
		}

		if(args.length == 1)
			message.channel.bulkDelete(2);
		else {
			const num = parseInt(args[1]);
			if(isNaN(num))
			{
				return message.channel.send('', {
					embed: {
						title: 'Please enter a valid number.',
						color: 0xFF0000
					}
				});
			}
			if(num > 99) {
				message.channel.send('', {
					embed: {
						title: 'Please enter a smaller number.',
						color: 0xFF0000
					}
				});
			} else {
				return message.channel.bulkDelete(num+1, true)
				.then(messages => 
					message.channel.send({
						embed: {
							description: `Bulk deleted ${messages.size} messages`,
							color: 0xFF8000
						}
					})
					.then(msg => msg.delete({timeout: 3500}))
					.catch()
				);
			}
		}
	},
	aliases: ['p'],
	description: 'Purges Messages',
	detailed: 'Purges Messages',
	examples: prefix => `${prefix}purge <number of message to delete>`,
	name: 'purge',
	perms: ['MANAGE_MESSAGES'],
	botPerms: ['MANAGE_MESSAGES'],
	guildOnly: true
}
