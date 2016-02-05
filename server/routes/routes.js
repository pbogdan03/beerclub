var express = require('express');
var router = express.Router();
require('colors');

var passport = require('../auth');
var h = require('../controller/helpers');
var Beer = require('../db/models/Beer');
var User = require('../db/models/User');

var instagramOptions = {};
var untappdOptions = {};
var beerToSave = {};

/**
 ***********************************************
 *	Home route
 ***********************************************
 */

router.get('/', function(req, res, next) {
	res.render('index');
});

/**
 ***********************************************
 *	Instagram Authentication (using Passport)
 ***********************************************
 */

router.get('/auth/instagram',
	passport.authenticate('instagram'),
	function(req, res, next) {
		console.log('[' + '/auth/instagram'.bgWhite.black + ']: ' + 'trying to receive accessToken'.white);
	});

router.get('/auth/instagram/callback',
	passport.authenticate('instagram', {failureRedirect: '/auth/instagram'}),
	function(req, res, next) {
		console.log('[' + '/auth/instagram/callback'.bgWhite.black + ']: ' + 'received accessToken: '.white + req.user.accessToken);
		req.session.accessToken = req.user.accessToken;
		res.redirect('/');
	});

/**
 ***********************************************
 *	MongoDB Routes
 ***********************************************
 */

router.get('/api/posts', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get beers from DB'.white);

	Beer.find({}).populate('createdBy').exec()
		.then(function(beers) {
			if (!beers.length) {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no beers'.white);
				res.send('');
			} else {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got beers from DB, sending them to client...'.white);
				res.send(beers);
			}
		}, function(err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			next(err);
		});
});

router.get('/api/users', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get users from DB'.white);

	User.find({}).populate('beers').exec()
		.then(function(users) {
			if (!users.length) {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no users'.white);
				res.send('');
			} else {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got users from DB, sending them to client...'.white);
				res.send(users);
			}
		}, function(err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			next(err);
		});
});

module.exports = router;
