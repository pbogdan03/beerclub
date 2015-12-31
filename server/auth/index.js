var express = require('express');
var passport = require('passport');
var util = require('util');
var InstagramStrategy = require('passport-instagram').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new InstagramStrategy({
		clientID: process.env.INSTA_ID,
		clientSecret: process.env.INSTA_PASS,
		callbackURL: 'http://localhost:3000/auth/instagram/callback'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null, {
				accessToken: accessToken,
				profile: profile
			});
		});
	}));

module.exports = passport;
