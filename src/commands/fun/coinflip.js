module.exports = {
	async run(message) {
		if (Math.random() > 0.5)
			return message.channel.send('', {
				embed: {
					title: 'Coin Flipped',
					description: 'Heads',
					color: colors.positive,
				},
			});
		else
			return message.channel.send('', {
				embed: {
					title: 'Coin Flipped',
					description: 'Tails',
					color: colors.positive,
				},
			});
	},
	description: 'Returns heads or tails.',
	detailed: 'Returns heads or tails.',
	examples: (prefix) => `${prefix}coinflip`,
	name: 'CoinFlip',
	perms: null,
	guildOnly: true,
};
