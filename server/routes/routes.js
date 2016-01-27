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
		return beerAndSave(result);
	})
	.then(function(beers) {
		//console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, beer:\n'.white + beer + '\n----------------------'.yellow);
		if (beers && beers.length) {
			res.redirect('/');
		} else {
			console.log(beers);
			//console.log('[' + '/instagram/posts'.bgWhite.black + ']: ' + 'from makeRequest, when beer is not an object:\n'.white + beer + '\n----------------------'.yellow);
		}
	})
	.catch(function(err) {
		console.error(err.stack);
		// res.redirect('/');
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
			console.log('[' + 'makeRequest'.bgWhite.black + ']: ' + options.hostname.white + ', STATUS: ' + res.statusCode);
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
						//reject(new Error('testing error from makeRequest'));
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

	return new Promise(function(resolve, reject) {
		_.each(data.data, function(el, index, list) {
			var beerDoc = new Beer({
				title: el.caption.text.match(regexTitle)[0].slice(0, -1),
				photoUrl: el.images.standard_resolution.url,
				instagramUrl: el.link,
				breweryUrl: 'To be completed from Untappd',
				description: 'To be completed from Untappd',
				untappdRating: 3,
				userRating: el.caption.text.match(regexRating)[0].slice(1, -1),
				date: new Date(el.created_time * 1000),
				createdBy: el.user.id,
			});

			_getBeerID(beerDoc)
			.then(function(beerInfo) {
				return _getBeerRating(beerInfo);
			})
			.then(function(beerDoc) {
				return _saveToDB(beerDoc);
			})
			.then(function(savedBeer) {
				savedBeers.push(savedBeer);
				if (index === list.length - 1) {
					resolve(savedBeers);
				}
			})
			.catch(function(err) {
				console.error(err.stack);
				reject(err);
			});
		});
	});

	function _getBeerID(beerDoc) {
		untappdOptions = {
			hostname: 'api.untappd.com',
			method: 'GET',
			path: '/v4/search/beer?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&q=' + beerDoc.title.replace(/\s/g, '%20'),
		};
		return makeRequest(untappdOptions)
		.then(function(result) {
			if (result !== null && typeof result === 'object') {
				var items = result.response.beers.items;
				var beerID;
				_.each(items, function(el, index, list) {
					if (el.beer.beer_name.toLowerCase() === beerDoc.title.toLowerCase()) {
						beerID = el.beer.bid;
						beerDoc.description = el.beer.beer_description;
						beerDoc.breweryUrl = el.brewery.contact.url;
					}
				});
				return {beerDoc: beerDoc, beerID: beerID};
			} else {
				return 'Received weird data from Untappd, need to try again...';
			}
		}, function(err) {
			return err;
		});
	}

	function _getBeerRating(beerInfo) {
		untappdOptions = {
			hostname: 'api.untappd.com',
			method: 'GET',
			path: '/v4/beer/info/' + beerInfo.beerID + '?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&compact=true',
		};
		return makeRequest(untappdOptions)
		.then(function(result) {
			if (result !== null && typeof result === 'object') {
				beerInfo.beerDoc.untappdRating = parseFloat(result.response.beer.rating_score);
				return beerInfo.beerDoc;
			} else {
				return 'Received weird data from Untappd, need to try again...';
			}
		}, function(err) {
			return err;
		});
	}

	function _saveToDB(beerDoc) {
		var savedBeer;
		// search for duplicates (faster than findOne)
		return Beer.find({title: beerDoc.title}).limit(1).exec()
		.then(function(beerInDB) {
			// if no duplicate entry in DB, save the document
			if (!beerInDB.length) {
				return beerDoc.save();
			} else {
				console.log('[' + 'makeRequest; Beer.find'.bgWhite.black + ']: ' + 'beer with: '.white + beerDoc.title.yellow + ' already in DB!'.white);
				return beerInDB;
			}
		})
		.then(function(result) {
			if (!result.length) { // if beerDoc.save (it's an object)
				console.log('[' + 'makeRequest; beer.save'.bgWhite.black + ']: ' + 'beer with: '.white + result.title.yellow + ' saved to DB!'.white);
				User.update({_id: result.createdBy}, {$addToSet: {beers: result}}, function(err, result) {
					if (err) {
						console.error(err.stack);
					} else {
						console.log('[' + 'makeRequest; user.update'.bgWhite.black + ']: ' + 'authenticated user updated with new beers!'.white);
					}
				});
			}
			return result;
		});
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
