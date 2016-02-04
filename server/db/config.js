var	mongoose = require('mongoose');
require('colors');

var dbURL = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + process.env.DB_HOST;

mongoose.connect(dbURL, function(err) {
	// TODO: handle timeout or errors somehow
	if (err) {
		throw err;
	}
	console.log('--->>> Connected to MongoLab...'.white);
});

module.exports = dbURL;
