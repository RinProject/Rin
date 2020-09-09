const https = require('https');

const url = 'https://graphql.anilist.co';

const query = `
query($search:String){
  Media (type: ANIME, search: $search, sort:START_DATE_DESC, status: RELEASING) {
    id
    siteUrl
    coverImage {
      large
      color
    }
    title {
      romaji
      english
      native
    }
    nextAiringEpisode{
      timeUntilAiring
      episode
    }
  }
}
`
function secondsToHuman(seconds){
	if(typeof(seconds)!=='number') return null;
	var d = Math.floor((seconds % 31536000) / 86400); 
	var h = Math.floor(((seconds % 31536000) % 86400) / 3600);
	var m = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
	var s = (((seconds % 31536000) % 86400) % 3600) % 60;
	return `${d} days ${h} hours ${m} minutes ${s} seconds`;
}
module.exports = {
	run: async function (message, args, colors) {
		if(args[1]){
			const data = JSON.stringify({
				query: query,
				variables: {search: message.content.replace(/^.+?\s/, '')}
			});
			const options = {	
				hostname: 'graphql.anilist.co',	
				path: '/',	
				method: 'POST',	
				headers: {	
				'Content-Type': 'application/json',	
				'Content-Length': data.length	
				}	
			}	
		
			const req = https.request(options, (res) => {
				let str = '';
				res.on('data', (chunk)=>{str += chunk;});
				res.on('error', err=>{throw err;})
				res.on('end', ()=>{
					let anime = JSON.parse(str).data.Media;
					if(!anime)
						return message.channel.send({
							embed: {
								title: 'Error 404',
								description: 'No such airing anime found',
								color: colors.error
							}
						});
					let embed = {
						title: anime.title.romanji||anime.title.english||anime.title.native,
						url: anime.siteUrl,
						description: `**Episode ${(anime.nextAiringEpisode||{}).episode||'Unknown'}**\nAiring in ${secondsToHuman((anime.nextAiringEpisode||{}).timeUntilAiring)||'Unknown'}`,
						thumbnail: {
							url: anime.coverImage.large
						},
						color: anime.coverImage.color||colors.base
					};
					if(anime.nextAiringEpisode||anime.nextAiringEpisode.timeUntilAiring){
						embed.timestamp = +new Date + anime.nextAiringEpisode.timeUntilAiring*1000;
						embed.footer = {text: 'Airing'};
					}
					message.channel.send({
						embed
					});
				});
			});	
			req.on('error', err=>{throw err;});	
			req.write(data);
			req.end();
		} else {
			message.channel.send({
				embed: {
					title: 'Feature unavailable',
					description: 'Currently only support for specific series air date is available.',
					color: colors.negative
				}
			});
		}
	},
	description: 'Shows airing anime',
	detailed: 'Shows a list of airing anime or a specific title, queried from https://anilist.co',
	examples: prefix => `${prefix}airing\n${prefix}next Shokugeki no Souma`,
	name: 'airing',
	aliases: ['next'],
	guildOnly: false
};
