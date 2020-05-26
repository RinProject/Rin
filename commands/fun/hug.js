const images = require('../JSONStorage/hug.js.json')
module.exports = {
	run: async function (message){
		if(message.mentions.users.first())
            message.channel.send('', {embed: {
                title:`${message.mentions.users.first().username} has been hugged by ${message.author.username}`,
                color: 0xff80cc,
                image: {
					url: images[Math.floor(Math.random()*images.length)]
				}
            }});
        else
            message.channel.send('', {embed: {
				title:'An error has occurred',
				description: 'it appears the person you have tried to hug does not exist.',
                color: 0xff0000
            }});
	},
	description: 'Hugs a user',
	detailed: 'Hugs first mentioned user',
	examples: prefix => `${prefix}hug @someone`,
	name: 'hug',
	perms: null,
};
