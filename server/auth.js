var express = require('express');
var passport = require('passport');
var util = require('util');
require('colors');
var mongoose = require('mongoose');
var InstagramStrategy = require('passport-instagram').Strategy;
var User = require('./db/models/User');

passport.serializeUser(function(obj, done) {
	console.log('[' + 'serializeUser'.bgWhite.black + ']: ' + 'trying to serialize user '.white + obj.user.name.yellow);
	done(null, obj.user.id);
});

passport.deserializeUser(function(id, done) {
	console.log('[' + 'deserializeUser'.bgWhite.black + ']: ' + 'trying to deserialize user with id: '.white + id.yellow);
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new InstagramStrategy({
		clientID: process.env.INSTA_ID,
		clientSecret: process.env.INSTA_PASS,
		callbackURL: 'http://localhost:5000/auth/instagram/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		User.findById(profile.id, function(err, user) {
			if (err) return done(err);
			if (!user) {
				user = new User({
					_id: profile.id,
					name: profile.displayName,
					username: profile.username
				});
				user.save(function(err) {
					if (err) console.log(err);
					console.log('[' + 'InstagramStrategy'.bgWhite.black + ']: ' + profile.username.yellow + ' saved!'.white);
					return done(null, {
						accessToken: accessToken,
						user: user
					});
				});
			} else {
				console.log('[' + 'InstagramStrategy'.bgWhite.black + ']: ' + profile.username.yellow + ' already in DB!'.white);
				return done(null, {
					accessToken: accessToken,
					user: user
				});
			}
		});
	}));

module.exports = passport;
