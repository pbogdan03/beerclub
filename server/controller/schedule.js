var express = require('express');
var CronJob = require('cron').CronJob;
var crypto = require('crypto');
require('colors');

var h = require('./helpers');
var User = require('../db/models/User');
var accessToken = '';

User.find({}).limit(1).exec()
.then(function(user) {
	if (user.length) {
		accessToken = user[0].accessToken;
		console.log('[' + '/'.bgWhite.black + ']: ' + 'accessToken available'.white);
		console.log(accessToken);
	} else {
		console.log('[' + '/'.bgWhite.black + ']: ' + 'no user in database'.white);
	}
}, function(err) {
	//retry
	console.error(err);
});

new CronJob('00 00 * * * *', function() {
	console.log('[' + 'CronJob'.bgWhite.black + ']: ' + '********* CronJob updating every hour..... *********'.white);
	updatePosts(accessToken);
}, null, true, 'Europe/Bucharest');

function updatePosts(accessToken) {
	var decipher = crypto.createDecipher('aes256', process.env.CRYPTO_PASS);
	var decryptedAccessToken = decipher.update(accessToken, 'hex', 'utf8') + decipher.final('utf8');
	instagramOptions = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + decryptedAccessToken //'16384709.6ac06b4.49b97800d7fd4ac799a2c889f50f2587'
	};
	h.retry(h.makeRequest, instagramOptions, 5)
	.then(function(result) {
		return h.beerAndSave(result);
	})
	.then(function(beers) {
		if (beers && beers.length) {
			console.log('[' + 'updatePosts'.bgWhite.black + ']: ' + 'Found new posts on Instagram, update complete'.white);
		} else {
			console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'No new posts on Instagram'.white);
		}
	})
	.catch(function(e) {
		console.log(e.stack);
		// accessToken expired
		try {
			if (e.message.meta.error_type === 'OAuthAccessTokenException') {
				console.log('[' + 'updatePosts'.bgWhite.black + ']: ' + 'accessToken no good, get another one'.white);
			}
		} catch (e) {}
	});
}
