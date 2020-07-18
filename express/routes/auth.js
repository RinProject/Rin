const router = require('express').Router();
const passport = require('passport');
const config = require('../../config.json');

router.get('/', (req, res)=>{res.redirect(config.redirect);});

router.get('/redirect', passport.authenticate('discord', {
	failureRedirect: '/fail'
}), (req, res)=>{
	res.send('uwu');
});

router.get('/info', (req, res)=>{
	res.send(req.user||'None');
});

module.exports = router;