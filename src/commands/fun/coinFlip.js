module.exports = {
	async run(message, args, colors) {
		message.channel.send('', {
			embed: {
				title: 'Tossed a coin',
				description: Math.random() > 0.5 ? 'Heads' : 'Tails',
				color: colors.success,
			},
		});
	},
	name: 'CoinFlip',
	description: 'Returns heads or tails.',
	detailed: 'Returns heads or tails.',
	aliases: ['Flip', 'CoinToss', 'Toss'],
	examples: [(prefix) => `${prefix}flip`],
};
