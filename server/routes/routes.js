var express = require('express');
var router = express.Router();
var https = require('https');
require('colors');
var _ = require('underscore');

var passport = require('../auth');
var Beer = require('../db/models/Beer');
var User = require('../db/models/User');

var accessToken = '';
var options = {};
var currentUser = {};

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
			path: '/v1/users/self/?access_token=' + accessToken
		};
		makeRequest(options, function(err, result) {
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

router.get('/instagram/posts', isAuthenticated, function(req, res, next) {
	options = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken
	};
	console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'got in the router'.white);
	makeRequest(options, function(err, result) {
		if (err) res.send(err);
		if (result) {
			saveBeerToDB(result);
		} else {
			res.send('No data available');
		}
		res.redirect('/');
	});
});

/**
 ***********************************************
 *	MongoDB Routes
 ***********************************************
 */

router.get('/api/posts', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get beers from DB'.white);

	Beer.find({}).populate('createdBy').exec(function(err, beers) {
		console.log(beers);
		if (err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			res.send(err);
		}
		if (!beers.length) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no beers'.white);
			res.send('');
		} else {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got beers from DB, sending them to client...'.white);
			res.send(beers);
		}
	});
});

router.get('/api/users', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get users from DB'.white);

	User.find({}).populate('beers').exec(function(err, users) {
		console.log(users);
		if (err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			res.send(err);
		}
		if (!users.length) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no users'.white);
			res.send('');
		} else {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got users from DB, sending them to client...'.white);
			res.send(users);
		}
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

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('[' + 'isAuthenticated'.bgWhite.black + ']: ' + 'user is authenticated, call next()'.green);
		return next();
	}
	console.log('[' + 'isAuthenticated'.bgWhite.black + ']: ' + 'user isn\'t authenticated, redirecting to /auth/instagram'.red);
	res.redirect('/auth/instagram');
}

function makeRequest(options, cb) {
	var request = https.request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.body = '';
		res.setEncoding('utf8');

		res.on('data', function(chunk) {
			//console.log('BODY: ' + chunk);
			res.body += chunk;
		});

		res.on('end', function() {
			console.log('No more data in response.');

			try {
				res.body = JSON.parse(res.body);
			} catch (e) {
				console.log(e);
			} finally {
				return cb(null, res.body);
			}
		});
	});

	request.on('error', function(err) {
		console.log('problem with request: ' + err.message);
		cb(err, null);
	});

	request.end();

}

function saveBeerToDB(data) {
	_.each(data.data, function(el, index, list) {
		console.log(el.images.standard_resolution.url);
		var captionTextArr = el.caption.text.split(' ');
		var beer = new Beer({
			title: captionTextArr[0],
			photoUrl: el.images.standard_resolution.url,
			instagram: el.link,
			description: 'To be completed from Untappd',
			untappdRating: 3,
			userRating: captionTextArr[1].slice(1, -1),
			date: new Date(el.created_time * 1000),
			createdBy: el.user.id
		});

		// faster than findOne
		Beer.find({'title': beer.title}).limit(1).exec(function(err, res) {
			if (err) {
				console.log('[' + 'makeRequest; Beer.findOne'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			}
			// if no duplicate entry in DB, save the document
			if (!res.length) {
				_saveToDB(beer);
			} else {
				console.log('[' + 'makeRequest; Beer.find'.bgWhite.black + ']: ' + 'beer with: '.white + beer.title.yellow + ' already in DB!'.white);
			}
		});
	});

	function _saveToDB(beer) {
		beer.save(function(err, beer) {
			if (err) console.log(err);

			// for populating the user with the new beer
			User.update({_id: beer.createdBy}, {$addToSet: {beers: beer}}, function(err, user) {
				if (err) console.log(err);
			});

			console.log('[' + 'makeRequest; beer.save'.bgWhite.black + ']: ' + 'beer with: '.white + beer.title.yellow + ' saved to DB!'.white);
		});
	}
}

module.exports = router;
