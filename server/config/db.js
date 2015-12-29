var	mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';

if ('development' === env) {
	require('dotenv').load();
}

var dbURL = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + process.env.DB_HOST;
mongoose.connect(dbURL, function(err) {
	if (err) throw err;
	console.log('Connected to MongoLab...');
});

var Schema = mongoose.Schema;
var beerSchema = new Schema({
	title: String,
	instagram: String,
	description: String,
	untappdRating: Number,
	userRating: Number,
	date: Date,
	user: {type: Number, ref: 'User'}
});

var Beer = mongoose.model('Beer', beerSchema);