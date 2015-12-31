var express = require('express');
var router = express.Router();
var passport = require('./../auth/index');
var https = require('https');

var accessToken = '';

router.get('/auth/instagram',
	passport.authenticate('instagram'),
	function(req, res, next) {});

router.get('/auth/instagram/callback',
	passport.authenticate('instagram', {failureRedirect: '/auth/instagram'}),
	function(req, res, next) {
		accessToken = req.user.accessToken;
		res.redirect('/');
	});

router.get('/user', function(req, res, next) {
	// TODO graceful fail on no token
	if (!accessToken) {
		res.send('No access token!');
	} else {
		var options = {
			hostname: 'api.instagram.com',
			method: 'GET',
			path: 'v1/users/256998851/?access_token=' + accessToken
		};
		makeRequest(options, function(err, result) {
			if (err) {
				res.send(err);
			} else {
				res.send(result);
			}
		});
	}
});

router.get('/', function(req, res, next) {
	res.render('index');
});

// HELPERS

var makeRequest = function(options, cb) {
	var request = https.request(options, function(req, res) {
		if (!res) {
			return cb('No res!', null);
		}
		console.log(options);
		var body = '';
		res.setEncoding('utf8');

		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			var obj = JSON.parse(body);
			return cb(null, obj);
		});
	});

	request.on('error', function(err) {
		cb(err, null);
	});
	request.end();
};

module.exports = router;
