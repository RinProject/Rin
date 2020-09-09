module.exports = {
	async run(message, args) {
		if(args.length == 1)
			message.channel.bulkDelete(2);
		else {
			const num = parseInt(args[1]);
			if(isNaN(num))
			{
				return message.channel.send('', {
					embed: {
						title: 'Please enter a valid number.',
						color: colors.error
					}
				});
			}
			if(num > 99) {
				message.channel.send('', {
					embed: {
						title: 'Please enter a smaller number.',
						color: colors.error
					}
				});
			} else {
				return message.channel.bulkDelete(num+1, true)
				.then(messages => 
					message.channel.send({
						embed: {
							description: `Bulk deleted ${messages.size} messages`,
							color: colors.success
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
	permissions: ['MANAGE_MESSAGES'],
	botPermissions: ['MANAGE_MESSAGES'],
	guildOnly: true
}
