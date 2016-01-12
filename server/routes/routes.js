var express = require('express');
var colors = require('colors');
var router = express.Router();
var passport = require('../auth');
var https = require('https');
var Beer = require('../config/db').beer;

var accessToken = '';
var options = {};

// >>>>>>>> Instagram authentication <<<<<<<<<<

router.get('/auth/instagram',
	passport.authenticate('instagram'),
	function(req, res, next) {});

router.get('/auth/instagram/callback',
	passport.authenticate('instagram', {failureRedirect: '/auth/instagram'}),
	function(req, res, next) {
		// Not the best way?
		accessToken = req.user.accessToken;
		console.log(req.user);
		res.redirect('/');
	});

// >>>>>>>>>> Helper routes <<<<<<<<<<<<

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

// >>>>>>>>>>> Instagram API <<<<<<<<<<<<<<

router.get('/instagram/posts', isAuthenticated, function(req, res, next) {
	console.log(req.session.passport.user);
	options = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken
	};
	console.log('[' + '/instagram/posts'.grey + ']: ' + 'got in the router'.green);
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
			res.send('Not authenticated!');
		}
	});
});

router.get('/api/posts', function(req, res, next) {
	console.log('trying to get posts from db');

	Beer.find({}, function(err, beers) {
		res.send(beers);
	});
});

// >>>>>>>>>>>>> INDEX <<<<<<<<<<<<<<<

router.get('/', function(req, res, next) {
	res.render('index');
});

// HELPERS

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('[' + 'isAuthenticated'.grey + ']: ' + 'user is authenticated, call next()'.green);
		return next();
	}
	console.log('[' + 'isAuthenticated'.grey + ']: ' + 'user isn\'t authenticated, redirecting to /auth/instagram'.red);
	res.redirect('/auth/instagram');
};

var makeRequest = function(options, cb) {
	var request = https.request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.body = '';
		res.setEncoding('utf8');

		res.on('error', function(err) {
			console.log(err);
		});

		res.on('data', function(chunk) {
			//console.log('BODY: ' + chunk);
			res.body += chunk;
		});

		res.on('end', function() {
			//console.log('No more data in response.');
			try {
				var obj = JSON.parse(res.body); 
			} catch(e) {
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
};

module.exports = router;
