var express = require('express');
var router = express.Router();
var passport = require('./../auth/index');
var https = require('https');
var Beer = require('../config/db').beer;

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

router.get('/api/beers', function(req, res, next) {
	// this should only get beers from DB not make a call to Instagram API
	options = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken
	};
	makeRequest(options, function(err, result) {
		if (err) res.send(err);
		if (result.data) {
			for (var i = 0, j = result.data.length; i < j; i++) {
				console.log(result.data[i]);
				var captionTextArr = result.data[i].caption.text.split(' ');
				var beer = new Beer({
					title: captionTextArr[0],
					instagram: result.data[i].link,
					description: 'To be completed from Untappd',
					untappdRating: 3,
					userRating: captionTextArr[1].slice(1, -1),
					date: new Date(result.data[i].created_time * 1000),
					createdBy: result.data[i].user.id
				});
				beer.save(function(err, beer) {
					if (err) console.log(err);
					console.log(beer + ' saved to DB!');
					// this should use populate to get beer document to have a relation with user
				});
			}
		} else {
			res.send("Not authenticated!");
		}
	});
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

module.exports = router;
