module.exports = {
	async run(message, args) {
		if(!message.client.owners.includes(message.author.id))
			return message.channel.send({embed: {
				title: 'Insufficient permissions.',
				description:'Only owners may use this command see [Nodejs](https://nodejs.org/en/download/) if you need a js environment.',
				color: colors.error
			}})
		message.channel.send(`\`${eval(args.slice(1).join(' '))}\``);
	},
	description: 'Owner only',
	detailed: 'Owner only',
	examples: prefix => `${prefix}eval 1 + 1`,
	name: 'eval',
	perms: null
}