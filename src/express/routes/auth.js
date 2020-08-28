const router = require('express').Router();
const passport = require('passport');
const config = require('../../../config.json');

router.get('/', (req, res)=>{res.redirect(config.redirect);});

router.get('/redirect', passport.authenticate('discord', {
	failureRedirect: '/fail'
}), (req, res)=>{
	res.redirect('/');
});

router.get('/logout', (req, res)=>{
	req.logout();
	res.redirect('/');
});

module.exports = router;