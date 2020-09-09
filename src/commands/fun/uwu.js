const { Command } = require('../../handler/index');
module.exports = new Command({
	run: async function (message, args, colors, prompt) {
		await prompt(message, /uwu/);
		message.channel.send('uwu');
	},
	description: 'Pats a user',
	detailed: 'Pats first mentioned user',
	examples: prefix => `${prefix}pat @member`,
	name: 'owo',	
	guildOnly: true
});
