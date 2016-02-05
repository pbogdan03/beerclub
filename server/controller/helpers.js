var https = require('https');
var _ = require('underscore');
require('colors');

var Beer = require('../db/models/Beer');
var User = require('../db/models/User');

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
						var error = new Error();
						error.name = 'statusCode: ' + res.statusCode;
						error.message = options.hostname + ' --- ' + res.body.meta.error_type;
						reject(error);
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
		if (data instanceof Error) {
			reject(data);
		}
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

			_updateBeerInfo(beerDoc)
			.then(function(beerDoc) {
				return _saveToDB(beerDoc);
			})
			.then(function(savedBeer) {
				if (savedBeer instanceof Error) {
					throw(savedBeer);
				}
				if (savedBeer) {
					savedBeers.push(savedBeer);
				}
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

	function _updateBeerInfo(beerDoc) {
		untappdOptions = {
			hostname: 'api.untappd.com',
			method: 'GET',
			path: '/v4/search/beer?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&q=' + beerDoc.title.replace(/\s/g, '%20'),
		};
		return retry(makeRequest, untappdOptions, 2)
		.then(function(result) {
			if (result instanceof Error) {
				return result;
			}
			if (result !== null && typeof result === 'object') {
				var items = result.response.beers.items;
				// var beerID;
				_.each(items, function(el, index, list) {
					if (el.beer.beer_name.toLowerCase() === beerDoc.title.toLowerCase()) {
						// beerID = el.beer.bid;
						beerDoc.description = el.beer.beer_description;
						beerDoc.breweryUrl = el.brewery.contact.url;
					}
				});
				return beerDoc;
			} else {
				return 'Received weird data from Untappd, need to try again...';
			}
		}, function(err) {
			return err;
		});
	}

	// function _getBeerRating(beerInfo) {
	// 	untappdOptions = {
	// 		hostname: 'api.untappd.com',
	// 		method: 'GET',
	// 		path: '/v4/beer/info/' + beerInfo.beerID + '?client_id=' + process.env.UNTAPPD_ID + '&client_secret=' + process.env.UNTAPPD_PASS + '&compact=true',
	// 	};
	// 	return makeRequest(untappdOptions)
	// 	.then(function(result) {
	// 		if (result !== null && typeof result === 'object') {
	// 			beerInfo.beerDoc.untappdRating = parseFloat(result.response.beer.rating_score);
	// 			return beerInfo.beerDoc;
	// 		} else {
	// 			return 'Received weird data from Untappd, need to try again...';
	// 		}
	// 	}, function(err) {
	// 		return err;
	// 	});
	// }

	function _saveToDB(beerDoc) {
		if (beerDoc instanceof Error) {
			return beerDoc;
		}
		var savedBeer;
		// search for duplicates (faster than findOne)
		return Beer.find({title: beerDoc.title}).limit(1).exec()
		.then(function(beerInDB) {
			// if no duplicate entry in DB, save the document
			if (!beerInDB.length) {
				return beerDoc.save();
			} else {
				console.log('[' + 'makeRequest; Beer.find'.bgWhite.black + ']: ' + 'beer with: '.white + beerDoc.title.yellow + ' already in DB!'.white);
				return;
			}
		})
		.then(function(result) {
			if (result) { // if beerDoc.save (it's an object)
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

// to use in case of server timeout from APIs
function retry(promise, arg, maxTries) {
	return promise(arg)
	.then(function(result) {
		return result;
	}, function(err) {
		if (maxTries > 1) {
			return retry(promise, arg, maxTries - 1);
		} else {
			return err;
		}
	});
}

module.exports = {
	makeRequest: makeRequest,
	beerAndSave: beerAndSave,
	retry: retry
};
