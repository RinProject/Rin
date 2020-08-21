const https = require('https');

const url = 'https://graphql.anilist.co';

const query = `
query($search:String){
  Media (type: ANIME, search: $search) {
    id
    siteUrl
    coverImage {
      extraLarge
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
const queryAll = {

};
`query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage){
    pageInfo {
      total
    }
    media(status:RELEASING, type: ANIME, sort:POPULARITY_DESC){
      id
      title {
        romaji
      }
      nextAiringEpisode{
        timeUntilAiring
      }
    }
  }
}`;
module.exports = {
	run: async function (message) {
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
				let result = JSON.parse(str).data;
				message.channel.send({
					embed: {
						title: result.Media.title.romanji||result.Media.title.english||result.Media.title.native,
						url: result.Media.siteUrl,
						description: `**Episode ${result.Media.nextAiringEpisode.episode}**\nAiring in ${result.Media.nextAiringEpisode.timeUntilAiring}`,
						thumbnail: {
							url: result.Media.coverImage.extraLarge
						},
						color: result.Media.coverImage.color
					}
				})
			});
		});	
		req.on('error', err=>{throw err;});	
		req.write(data);
		req.end();
	},
	description: 'Shows airing anime',
	detailed: 'Shows a list of airing anime or a specific title, queried from https://anilist.co',
	examples: prefix => `${prefix}airing\n${prefix}next Shokugeki no Souma`,
	name: 'airing',
	aliases: ['next'],
	perms: null,
	guildOnly: false
};
