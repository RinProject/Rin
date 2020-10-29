const options = require('../../../JSONstorage/timeFormatOptions.json');
const formatter = new Intl.DateTimeFormat('en-GB', options);
module.exports = {
	async run(message, args, colors) {
		let voiceChannels = 0,
			textChannels = 0;

		let people = 0,
			bots = 0;

		let roles = 0;

		message.guild.channels.cache.each((channel) => {
			if (channel.type == 'voice') voiceChannels++;
			if (channel.type == 'text') textChannels++;
		});

		message.guild.members.cache.each((member) => {
			if (member.user.bot) bots++;
			else people++;
		});

		message.guild.roles.cache.each((role) => {
			if (role) roles++;
		});

		message.channel.send({
			embed: {
				title: `Info for ${message.guild.name}`,
				color: colors.base,
				thumbnail: {
					url: message.guild.iconURL({
						format: 'png',
						dynamic: true,
					}),
				},
				author: {
					name: message.guild.name,
					iconURL: message.guild.iconURL({
						format: 'png',
						dynamic: true,
					}),
				},
				fields: [
					{
						name: 'Owner',
						value: message.guild.owner.toString(),
						inline: true,
					},
					{
						name: 'Region',
						value: (await message.guild.fetchVoiceRegions()).findKey((region) => region.optimal),
						inline: true,
					},
					{
						name: 'Prefix',
						value: message.client.prefix(),
						inline: true,
					},
					{
						name: 'Members',
						value: message.guild.memberCount,
						inline: true,
					},
					{
						name: 'Humans',
						value: people,
						inline: true,
					},
					{
						name: 'Bots',
						value: bots,
						inline: true,
					},
					{
						name: 'Channels',
						value: textChannels + voiceChannels,
						inline: true,
					},
					{
						name: 'Text',
						value: textChannels,
						inline: true,
					},
					{
						name: 'Voice',
						value: voiceChannels,
						inline: true,
					},
					{
						name: 'Roles',
						value: roles,
						inline: true,
					},
					{
						name: 'Emojis',
						value: message.guild.emojis.cache.size,
						inline: true,
					},
					{
						name: 'Verification',
						value: (() => {
							let level = message.guild.verificationLevel.toLowerCase().split('');
							level[0] = level[0].toUpperCase();
							return level.join('');
						})(),
						inline: true,
					},
					{
						name: 'Created At',
						value: formatter.format(message.guild.createdAt),
						inline: false,
					},
				],
				footer: {
					text: `id: ${message.guild.id}`,
				},
				timestamp: +new Date(),
			},
		});
	},
	aliases: ['info'],
	description: 'Returns info about the server',
	detailed: 'Returns info about the server',
	examples: (prefix) => `${prefix}serverinfo`,
	name: 'serverinfo',
	guildOnly: true,
};
