const images = ['https://media.tenor.com/images/a671268253717ff877474fd019ef73e9/tenor.gif' ,'https://media.tenor.com/images/ad8357e58d35c1d63b570ab7e587f212/tenor.gif','https://media1.tenor.com/images/f330c520a8dfa461130a799faca13c7e/tenor.gif?itemid=13911345','https://media1.tenor.com/images/c0bcaeaa785a6bdf1fae82ecac65d0cc/tenor.gif?itemid=7453915','https://media1.tenor.com/images/1e92c03121c0bd6688d17eef8d275ea7/tenor.gif?itemid=9920853','https://media1.tenor.com/images/1e92c03121c0bd6688d17eef8d275ea7/tenor.gif?itemid=9920853','https://media.tenor.com/images/228c2db2be8cfee48ca3a07c4847a45b/tenor.gif','https://media.tenor.com/images/fae89a67a608d091c9f4bab9189210fa/tenor.gif','https://media.tenor.com/images/fae89a67a608d091c9f4bab9189210fa/tenor.gif','https://tenor.com/view/anime-anime-headrub-anime-headpat-loli-kawaii-gif-16085284','https://media1.tenor.com/images/282cc80907f0fe82d9ae1f55f1a87c03/tenor.gif?itemid=12018857','https://media1.tenor.com/images/3f3e1d2187bc5815c2dc3cbcb075535f/tenor.gif?itemid=15118749','https://media1.tenor.com/images/143a887b46092bd880997119ecf09681/tenor.gif?itemid=15177421'];
module.exports = {
	run: async function (message){
		if(message.mentions.users.first())
            message.channel.send('', {embed: {
                title:`${message.mentions.users.first().username} has been patted by ${message.author.username}`,
                color: 0xff80cc,
                image: {
					url: images[Math.floor(Math.random()*images.length)]
				}
            }});
        else
            message.channel.send('', {embed: {
				title:'An error has occurred',
				description: 'it appears the person you have tried to pat does not exist.',
                color: 0xff0000
            }});
	},
	description: 'Pats a user',
	detailed: 'Pats first mentioned user',
	examples: prefix => `${prefix}pat @someone`,
	name: 'pat',
	perms: null,
};