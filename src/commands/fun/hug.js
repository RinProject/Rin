const images = require('../../../JSONstorage/hug.json');
module.exports = {
	run: async function (message, args, colors) {
		let member =
			message.mentions.members.first() || (await message.guild.members.cache.get(args[1]));

		if (member) {
			if (message.author.id == member.user.id) {
				return message.channel.send('', {
					embed: {
						title: `${member.user.tag} has been hugged by ${message.client.user.tag}`,
						description: `You tried to hug yourself? Don't worry, it'll be okay.`,
						color: colors.base,
						image: {
							url: images[Math.floor(Math.random() * images.length)],
						},
					},
				});
			} else {
				return message.channel.send('', {
					embed: {
						title: `${member.user.tag} has been hugged by ${message.author.tag}`,
						color: colors.base,
						image: {
							url: images[Math.floor(Math.random() * images.length)],
						},
					},
				});
			}
		} else
			return message.channel.send('', {
				embed: {
					title: 'An error has occurred',
					description: 'It appears the person you have tried to hug does not exist.',
					color: colors.error,
				},
			});
	},
	description: 'Hugs a user.',
	detailed: 'Hugs a mentioned user with a cute image or gif.',
	examples: (prefix) => `${prefix}hug @Jihyo#3301`,
	name: 'Hug',
	guildOnly: true,
};
