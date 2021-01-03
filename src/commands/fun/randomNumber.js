let allowedMax = Math.pow(2, 33); //Max number allowed it 2^33
let randNum = 0;

module.exports = {
	async run(message, args) {
		let n = parseInt(args[1]) || 100;
		if (n > allowedMax) n = allowedMax;
		randNum = Math.floor(Math.random() * n) + 1;
		return message.channel.send('', {
			embed: {
				title: 'Random number generated',
				description: `${randNum}`,
				color: colors.positive,
			},
		});
	},
	aliases: ['RandNum'],
	description: 'Returns a random number.',
	detailed: 'Returns a random number in a given range or in a bot generated maximum.',
	examples: [(prefix) => `${prefix}randomnumber`, (prefix) => `${prefix}randomnumber 1000`],
	name: 'RandomNumber',
	perms: null,
	guildOnly: true,
};
