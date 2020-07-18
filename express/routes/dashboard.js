const router = require('express').Router();
const config = require('../../config.json');
const fs = require('fs');
const logs = fs.readFileSync(__dirname+'/dashboard/logs.html');

router.get('/', (req, res)=>{
	res.render('index', {req: req, content: 'Dashboard', title: 'Log dashboard'})
});

router.get('/:guild/logs', (req, res)=>{
	res.render('index', {req: req, content: logs, title: 'Log dashboard'})
});

module.exports = router;