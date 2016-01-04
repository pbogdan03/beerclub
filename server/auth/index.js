var express = require('express');
var passport = require('passport');
var util = require('util');
var mongoose = require('mongoose');
var InstagramStrategy = require('passport-instagram').Strategy;
var User = require('../config/db').user;

passport.serializeUser(function(obj, done) {
	console.log(obj);
	done(null, obj.user.id);
});

passport.deserializeUser(function(id, done) {
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
			console.log(user);
			if (!user) {
				user = new User({
					_id: profile.id,
					name: profile.displayName,
					username: profile.username
				});
				user.save(function(err) {
					if (err) console.log(err);
					console.log(profile.username + ' saved!');
					return done(null, {
						accessToken: accessToken,
						user: user
					});
				});
			} else {
				console.log(profile.username + ' already in DB!');
				return done(null, {
					accessToken: accessToken,
					user: user
				});
			}
		});
	}));

module.exports = passport;
