const router = require('express').Router();
const fs = require('fs');
const converter = new (require('showdown')).Converter({ghCompatibleHeaderId: true});

let docs = `${fs.readFileSync('./docs/moderation.md')}\n${fs.readFileSync('./docs/utility.md')}\n${fs.readFileSync('./docs/fun.md')}\n${fs.readFileSync('./docs/system.md')}`;
docs = (()=>{
	let res = '';
	docs.match(/^#{1,2} .*/gim).forEach(match => {
		res+=`${match.startsWith('# ')?'</ul></li><li><ul>':''}<li>${match.startsWith('# ')?'<h3>':''}<a href="#${match.replace(/^#{1,2} |\s/g, '').toLowerCase()}">${match.replace(/#{1,2} /, '')}</a>${match.startsWith('# ')?'</h3>':''}</li>`
	});
	return `<ul class="docsLinks">${res.replace(/^<\/ul><\/li>/, '')}</ul></li></ul>\n`
})()+converter.makeHtml(docs);

router.get('/', (req, res)=>{
	res.render('index', {req: req, content: docs, title: 'Docs'})
});

module.exports = router;