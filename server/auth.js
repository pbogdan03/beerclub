var express = require('express');
var passport = require('passport');
var util = require('util');
require('colors');
var mongoose = require('mongoose');
var InstagramStrategy = require('passport-instagram').Strategy;
var crypto = require('crypto');

var User = require('./db/models/User');

passport.serializeUser(function(user, done) {
	console.log(user);
	console.log('[' + 'serializeUser'.bgWhite.black + ']: ' + 'trying to serialize user '.white + user.username.yellow);
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	console.log('[' + 'deserializeUser'.bgWhite.black + ']: ' + 'trying to deserialize user with id: '.white + id);
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new InstagramStrategy({
		clientID: process.env.INSTA_ID,
		clientSecret: process.env.INSTA_PASS,
		callbackURL: process.env.APP_HOST + '/auth/instagram/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		//console.log('-----------------------');
		//console.log(profile);
		var cipher = crypto.createCipher('aes256', process.env.CRYPTO_PASS);
		var encryptedAccessToken = cipher.update(accessToken, 'utf8', 'hex') + cipher.final('hex');

		User.find({accessToken: encryptedAccessToken}).exec()
		.then(function(user) {
			if (!user.length) {
				user = new User({
					_id: parseInt(profile.id),
					name: profile.displayName,
					username: profile.username,
					accessToken: encryptedAccessToken
				});
				user.save(function(err) {
					if (err) console.log(err);
					console.log('[' + 'InstagramStrategy'.bgWhite.black + ']: ' + profile.username.yellow + ' saved!'.white);
					return done(null, user);
				});
			} else {
				console.log('[' + 'InstagramStrategy'.bgWhite.black + ']: ' + profile.username.yellow + ' already in DB!'.white);
				return done(null, user);
			}
		}, function(err) {
			return done(err);
		});
	}));

module.exports = passport;
