var express = require('express');
var router = express.Router();
var https = require('https');
require('colors');

var passport = require('../auth');
var Beer = require('../db/models/Beer');

var accessToken = '';
var options = {};

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
		accessToken = req.user.accessToken;
		console.log('[' + '/auth/instagram/callback'.bgWhite.black + ']: ' + 'received accessToken: '.white + accessToken.yellow);
		res.redirect('/');
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
	console.log(req.session.passport.user);
	options = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken
	};
	console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'got in the router'.white);
	makeRequest(options, function(err, result) {
		if (err) res.send(err);
		//console.log(result);
		if (result.data) {
			for (var i = 0, j = result.data.length; i < j; i++) {
				//console.log(result.data[i]);
				var captionTextArr = result.data[i].caption.text.split(' ');
				var beer = new Beer({
					title: captionTextArr[0],
					instagram: result.data[i].link,
					description: 'To be completed from Untappd',
					untappdRating: 3,
					userRating: captionTextArr[1].slice(1, -1),
					date: new Date(result.data[i].created_time * 1000), // jscs:disable
					createdBy: result.data[i].user.id
				});
				/* jshint ignore:start */
				beer.save(function(err, beer) {
					if (err) console.log(err);
					console.log(beer + ' saved to DB!');
					// this should use populate to get beer document to have a relation with user
				});
				/* jshint ignore:end */
			}
		} else {
			res.send('Not authenticated!');
		}
	});
});

/**
 ***********************************************
 *	MongoDB Routes
 ***********************************************
 */

router.get('/api/posts', function(req, res, next) {
	//console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'req.session: '.white + req.session.yellow);
	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get beers from DB'.white);

	Beer.find({}, function(err, beers) {
		if(err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			res.send(err);
		} else {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got beers from DB, sending them to client...'.white);
			res.send(beers);
		}
	});
});

router.get('/api/users', function(req, res, next) {
	res.send("Yes, this is user!");
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

		res.on('error', function(err) {
			console.log(err);
		});

		res.on('data', function(chunk) {
			console.log('BODY: ' + chunk);
			res.body += chunk;
		});

		res.on('end', function() {
			var obj = {};
			//console.log('No more data in response.');
			try {
				obj = JSON.parse(res.body);
			} catch (e) {
				console.log('malformed request', res.body);
				return res.send('malformed request: ' + res.body);
			}
			return cb(null, obj);
		});
	});

	request.on('error', function(err) {
		console.log('problem with request: ' + err.message);
		cb(err, null);
	});
	request.end();
}

module.exports = router;
