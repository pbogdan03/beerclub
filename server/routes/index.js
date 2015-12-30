var express = require('express');
var router = express.Router();
var https = require('https');
var query = require('querystring');

var accessToken;

// INSTAGRAM
var redirect_uri = 'http://localhost:3000/instauth';
var instaPost = function(options, data, cb) {
	var req = https.request(options, function(res) {
		var body = '';
		res.setEncoding('utf8');

		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			var result;
			try {
				result = JSON.parse(body);
			} catch (err) {
				return cb(err, null);
			}
			return cb(null, result);
		});
	});
	req.write(data);
	req.end();
};

router.get('/authorize_user', function(req, res, next) {
	res.redirect('https://api.instagram.com/oauth/authorize/?client_id=' + process.env.INSTA_ID + '&redirect_uri=http://localhost:3000/instauth&response_type=code');
});

router.get('/instauth', function(req, res, next) {
	var data = {
		client_id: process.env.INSTA_ID,
		client_secret: process.env.INSTA_PASS,
		grant_type: 'authorization_code',
		redirect_uri: redirect_uri,
		code: req.query.code
	};
	var dataString = query.stringify(data);
	var options = {
		hostname: 'api.instagram.com',
		path: '/oauth/access_token',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': dataString.length
		}
	};
	instaPost(options, dataString, function(err, result) {
		if (err) {
			res.send(err);
		} else {
			accessToken = result.access_token;
			res.redirect('/');
		}
	});
});

router.get('/', function(req, res, next) {
	res.render('index');
});

module.exports.router = router;
module.exports.accessToken = accessToken;
