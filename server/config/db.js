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

var userSchema = new Schema({
	_id: String,
	name: String,
	username: String,
	beers: [{type: Schema.Types.ObjectId, ref: 'Beer'}]
});
var beerSchema = new Schema({
	title: String,
	instagram: String,
	description: String,
	untappdRating: Number,
	userRating: Number,
	date: Date,
	createdBy: {type: Number, ref: 'User'}
});

var User = mongoose.model('User', userSchema);
var Beer = mongoose.model('Beer', beerSchema);

module.exports = {
	'user': User,
	'beer': Beer
};
