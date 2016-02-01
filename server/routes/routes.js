var express = require('express');
var router = express.Router();
require('colors');

var passport = require('../auth');
var h = require('./helpers');
var Beer = require('../db/models/Beer');
var User = require('../db/models/User');

var accessToken = '';
var instagramOptions = {};
var untappdOptions = {};
var currentUser = {};
var beerToSave = {};

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
		// Not the best way?
		currentUser = req.user.user;
		accessToken = req.user.accessToken;

		console.log('[' + '/auth/instagram/callback'.bgWhite.black + ']: ' + 'received accessToken: '.white + accessToken.yellow);
		res.redirect('/instagram/posts');
	});

/**
 ***********************************************
 *	Helper routes
 ***********************************************
 */

router.get('/user', function(req, res, next) {
	// TODO graceful fail on no token
	if (!accessToken) {
		res.send('No access token!');
	} else {
		options = {
			hostname: 'api.instagram.com',
			method: 'GET',
			path: '/v1/users/self/?access_token=' + accessToken,
		};
		h.makeRequest(options, function(err, result) {
			if (err) res.send(err);
			res.send(result);
		});
	}
});

/**
 ***********************************************
 *	Instagram API
 ***********************************************
 */

router.get('/instagram/posts', h.isAuthenticated, function(req, res, next) {
	instagramOptions = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken,
	};
	console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'got in the router'.white);

	h.makeRequest(instagramOptions)
	.then(function(result) {
		return h.beerAndSave(result);
	})
	.then(function(beers) {
		//console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, beer:\n'.white + beer + '\n----------------------'.yellow);
		if (beers && beers.length) {
			res.redirect('/');
		} else {
			console.log(beers);
			//console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, when beer is not an object:\n'.white + beer + '\n----------------------'.yellow);
		}
	})
	.catch(function(err) {
		console.error(err.stack);
		// res.redirect('/');
	});

	// _retry(makeRequest(instagramOptions))
	// .then(function(result) {
	// 	return composeBeerDoc(result);
	// })
	// .then(function(beer) {
	// 	res.redirect('/');
	// })
	// .catch(function(err) {
	// 	res.send(err);
	// });
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
			res.send(err);
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
			res.send(err);
		});
});

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
 *	Helper functions
 ***********************************************
 */


module.exports = router;
