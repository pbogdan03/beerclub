var express = require('express');
var router = express.Router();
var passport = require('./../auth/index');
var https = require('https');

var accessToken = '';
var options = {};

router.get('/auth/instagram',
	passport.authenticate('instagram'),
	function(req, res, next) {});

router.get('/auth/instagram/callback',
	passport.authenticate('instagram', {failureRedirect: '/auth/instagram'}),
	function(req, res, next) {
		// Not the best way?
		accessToken = req.user.accessToken;
		res.redirect('/');
	});

router.get('/api/beers', function(req, res, next) {
	options = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken
	};
	makeRequest(options, function(err, result) {
		if (err) res.send(err);
		res.send(result);
	});
});

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

router.get('/', function(req, res, next) {
	res.render('index');
});

// HELPERS

var makeRequest = function(options, cb) {
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
			//console.log('No more data in response.');
			var obj = JSON.parse(res.body);
			return cb(null, obj);
		});
	});

	request.on('error', function(err) {
		console.log('problem with request: ' + err.message);
		cb(err, null);
	});
	request.end();
};

var isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated())
		return next();
	console.log('no user logged in!');
	res.redirect('/');
};

module.exports = router;
