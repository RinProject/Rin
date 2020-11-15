const fs = require('fs');

module.exports = (client) => {
	let files = fs.readdirSync(__dirname).filter((v) => v !== 'index.js' && v.endsWith('.js'));

	files.forEach((v) => {
		require(`${__dirname}/${v}`)(client);
		// console.log(`Loaded event "${v.slice(0, -3)}"`);
	});
};
