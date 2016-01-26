var express = require('express');
var router = express.Router();
var https = require('https');
require('colors');
var _ = require('underscore');

var passport = require('../auth');
var Beer = require('../db/models/Beer');
var User = require('../db/models/User');

var accessToken = '';
var instagramOptions = {};
var untappdOptions = {};
var currentUser = {};
var beerToSave = {};

/**
 ***********************************************
 *	Instagram Authentication (using Passport)
 ***********************************************
 */

router.get('/auth/instagram',
	passport.authenticate('instagram'),
	function(req, res, next) {
		console.log('[' + '/auth/instagram'.bgWhite.black + ']: ' + 'trying to receive accessToken'.white);
	});

router.get('/auth/instagram/callback',
	passport.authenticate('instagram', {failureRedirect: '/auth/instagram'}),
	function(req, res, next) {
		// Not the best way?
		currentUser = req.user.user;
		accessToken = req.user.accessToken;

		console.log('[' + '/auth/instagram/callback'.bgWhite.black + ']: ' + 'received accessToken: '.white + accessToken.yellow);
		res.redirect('/instagram/posts');
	});

/**
 ***********************************************
 *	Helper routes
 ***********************************************
 */

router.get('/user', function(req, res, next) {
	// TODO graceful fail on no token
	if (!accessToken) {
		res.send('No access token!');
	} else {
		options = {
			hostname: 'api.instagram.com',
			method: 'GET',
			path: '/v1/users/self/?access_token=' + accessToken,
		};
		makeRequest(options, function(err, result) {
			if (err) res.send(err);
			res.send(result);
		});
	}
});

/**
 ***********************************************
 *	Instagram API
 ***********************************************
 */

router.get('/instagram/posts', isAuthenticated, function(req, res, next) {
	instagramOptions = {
		hostname: 'api.instagram.com',
		method: 'GET',
		path: '/v1/users/self/media/recent/?access_token=' + accessToken,
	};
	console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'got in the router'.white);

	makeRequest(instagramOptions)
	.then(function(result) {
		var savedBeers = beerAndSave(result);
		if (!savedBeers) {
			console.log('no beers saved!');
		} else {
			console.log(savedBeers);
		}
	})
	// .then(function(beer) {
	// 	console.log(beer);
	// })
	.catch(function(err) {
		console.log(err);
	});

	// _retry(makeRequest(instagramOptions))
	// .then(function(result) {
	// 	return composeBeerDoc(result);
	// })
	// .then(function(beer) {
	// 	res.redirect('/');
	// })
	// .catch(function(err) {
	// 	res.send(err);
	// });
});

/**
 ***********************************************
 *	MongoDB Routes
 ***********************************************
 */

router.get('/api/posts', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get beers from DB'.white);

	Beer.find({}).populate('createdBy').exec()
		.then(function(beers) {
			if (!beers.length) {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no beers'.white);
				res.send('');
			} else {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got beers from DB, sending them to client...'.white);
				res.send(beers);
			}
		}, function(err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			res.send(err);
		});
});

router.get('/api/users', function(req, res, next) {

	console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'trying to get users from DB'.white);

	User.find({}).populate('beers').exec()
		.then(function(users) {
			if (!users.length) {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'no users'.white);
				res.send('');
			} else {
				console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'got users from DB, sending them to client...'.white);
				res.send(users);
			}
		}, function(err) {
			console.log('[' + '/api/posts'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			res.send(err);
		});
});

/**
 ***********************************************
 *	Home route
 ***********************************************
 */

router.get('/', function(req, res, next) {
	res.render('index');
});

/**
 ***********************************************
 *	Helper functions
 ***********************************************
 */

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('[' + 'isAuthenticated'.bgWhite.black + ']: ' + 'user is authenticated, call next()'.green);
		return next();
	}

	console.log('[' + 'isAuthenticated'.bgWhite.black + ']: ' + 'user isn\'t authenticated, redirecting to /auth/instagram'.red);
	res.redirect('/auth/instagram');
}

function makeRequest(options) {
	return new Promise(function(resolve, reject) {
		var request = https.request(options, function(res) {
			console.log('[' + 'makeRequest'.bgWhite.black + ']: ' + options.hostname.white);
			console.log('STATUS: ' + res.statusCode);
			// console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.body = '';
			res.setEncoding('utf8');

			res.on('data', function(chunk) {
				//console.log('BODY: ' + chunk);
				res.body += chunk;
			});

			res.on('end', function() {
				console.log('No more data in response.');

				try {
					res.body = JSON.parse(res.body);
				} catch (e) {
					reject(e);
				} finally {
					if (res.statusCode !== 200) {
						reject(new Error('statusCode: ' + res.statusCode));
					} else {
						resolve(res.body);
					}
				}
			});
		});

		request.on('error', function(err) {
			reject(new Error(err));
		});

		request.end();
	});
}

function beerAndSave(data) {
	var regexTitle = new RegExp(/[^[]*/);
	var regexRating = new RegExp(/\[(.*)\]/);
	var savedBeers = [];

	_.each(data.data, function(el, index, list) {
		var beerDoc = new Beer({
			title: el.caption.text.match(regexTitle)[0].slice(0, -1),
			photoUrl: el.images.standard_resolution.url,
			instagram: el.link,
			description: 'To be completed from Untappd',
			untappdRating: 3,
			userRating: el.caption.text.match(regexRating)[0].slice(1, -1),
			date: new Date(el.created_time * 1000),
			createdBy: el.user.id
		});

		_getBeerID(beerDoc)
		.then(function(beerID) {
			console.log(beerID);
			return _getBeerRating(beerDoc, beerID);
		})
		.then(function(beerDoc) {
			console.log(beerDoc);
			var beeres = _saveToDB(beerDoc);
			//savedBeers.push(beeres);
			//console.log(beeres);
		})
		.catch(function(err) {
			console.log(err);
		});

	});
	console.log(savedBeers);
	return savedBeers;

	function _getBeerID(beer) {
		untappdOptions = {
			hostname: 'api.untappd.com',
			method: 'GET',
			path: '/v4/search/beer?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&q=' + beer.title.replace(/\s/g, '%20'),
		};
		return new Promise(function(resolve, reject) {
			makeRequest(untappdOptions)
			.then(function(result) {
				if (result !== null && typeof result === 'object') {
					var items = result.response.beers.items;
					var beerID;
					_.each(items, function(el, index, list) {
						if (el.beer.beer_name.toLowerCase() === beer.title.toLowerCase()) {
							beerID = el.beer.bid;
							beer.description = el.beer.beer_description;
						}
					});
					resolve(beerID);
				} else {
					reject('Received weird data from Untappd...');
				}
			}, function(err) {
				reject(err);
			});
		});
	}

	function _getBeerRating(beerDoc, beerID) {
		untappdOptions = {
			hostname: 'api.untappd.com',
			method: 'GET',
			path: '/v4/beer/info/' + beerID + '?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&compact=true',
		};
		return new Promise(function(resolve, reject) {
			makeRequest(untappdOptions)
			.then(function(result) {
				beerDoc.untappdRating = parseFloat(result.response.beer.rating_score);
				resolve(beerDoc);
			}, function(err) {
				reject(err);
			});
		});
	}

	function _saveToDB(beer) {
		var savedBeer;
		// search for duplicates (faster than findOne)
		Beer.find({title: beer.title}).limit(1).exec()
		.then(function(beers) {
			// if no duplicate entry in DB, save the document
			if (!beers.length) {
				return beer.save();
			} else {
				console.log('[' + 'makeRequest; Beer.find'.bgWhite.black + ']: ' + 'beer with: '.white + beer.title.yellow + ' already in DB!'.white);
			}
		})
		.then(function(beer) {
			savedBeer = beer;
			console.log('[' + 'makeRequest; beer.save'.bgWhite.black + ']: ' + 'beer with: '.white + beer.title.yellow + ' saved to DB!'.white);
			return User.update({_id: beer.createdBy}, {$addToSet: {beers: beer}});
		})
		.then(function(user) {
			// TODO: change for multiple users (or delete)
			// for populating the user with the new beer
			console.log('User updated with new beers');
		})
		.catch(function(err) {
			console.log('[' + 'makeRequest; Beer.findOne'.bgWhite.black + ']: ' + 'error for connecting: '.white + err.yellow);
			console.log(err);
		});

		return savedBeer;
	}
}

function _retry(promise, arg) {
	return promise(arg)
	.then(function(result) {
		return result;
	}, function(err) {
		_retry(promise);
	});

	// return promise()
	// .then(function(result) {
	// 	return result;
	// }, function(err) {
	// 	_retry(promise);
	// });
}

module.exports = router;
