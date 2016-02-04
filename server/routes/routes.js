var express = require('express');
var router = express.Router();
require('colors');
var stringify = require('json-stringify-safe');

var passport = require('../auth');
var h = require('./helpers');
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
	if (!req.session.accessToken) {
		User.find({}).limit(1).exec()
		.then(function(user) {
			if (user.length) {
				req.session.accessToken = user[0].accessToken;
				console.log('[' + '/'.bgWhite.black + ']: ' + 'accessToken stored in session'.white);
				console.log(req.session.accessToken);
				res.render('index');
			} else {
				console.log('[' + '/'.bgWhite.black + ']: ' + 'no user in database'.white);
				res.redirect('/auth/instagram');
			}
		}, function(err) {
			//retry
			console.error(err);
			next(err);
		});
	} else {
		res.render('index');
	}
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
		console.log('[' + '/auth/instagram/callback'.bgWhite.black + ']: ' + 'received accessToken: '.white + req.session.accessToken.yellow);
		res.redirect('/instagram/posts');
	});

/**
 ***********************************************
 *	Instagram API
 ***********************************************
 */

router.get('/instagram/posts', function(req, res, next) {
	if (req.session.accessToken) {
		instagramOptions = {
			hostname: 'api.instagram.com',
			method: 'GET',
			path: '/v1/users/self/media/recent/?access_token=' + req.session.accessToken //'16384709.6ac06b4.49b97800d7fd4ac799a2c889f50f2587'
		};
		console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'accessToken in session, getting instagram posts'.white);
		h.retry(h.makeRequest, instagramOptions, 5)
		.then(function(result) {
			return h.beerAndSave(result);
		})
		.then(function(beers) {
			// console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, beers:\n'.white + beers + '\n----------------------'.yellow);
			if (beers && beers.length) {
				res.redirect('/');
			} else {
				console.log('no new beers on instagram');
				res.redirect('/');
				//console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, when beer is not an object:\n'.white + beer + '\n----------------------'.yellow);
			}
		})
		.catch(function(err) {
			console.log(err.stack);
			// accessToken expired
			try {
				if (err.message.meta.error_type === 'OAuthAccessTokenException') {
					res.redirect('/auth/instagram');
				}
			} catch (err) {}
			next(err);
		});
	} else {
		console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'no accessToken in session'.white);
		res.redirect('/');
	}
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
