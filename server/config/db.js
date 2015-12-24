var	mongoose = require('mongoose');
var env = require('dotenv').load();

var dbURL = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + process.env.DB_HOST;
mongoose.connect(dbURL, function(err) {
	if (err) throw err;
	console.log('Connected to MongoLab...');
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
	name: {
		first: String,
		last: String
	},
	username: String,
	pass: String,
	beers: [{type: Schema.Types.ObjectId, ref: 'Beer'}]
});
var beerSchema = new Schema({
	title: String,
	instagram: String,
	description: String,
	untappdRating: Number,
	userRating: Number,
	date: Date,
	user: {type: Number, ref: 'User'}
});

var User = mongoose.model('User', userSchema);
var Beer = mongoose.model('Beer', beerSchema);

var bogdan = new User({
	name: {
		first: 'Bogdan',
		last: 'P'
	},
	username: 'p_bogdan03',
	pass: 'hello',
	beers: []
});

User.findOne({'username': 'p_bogdan03'}, function(err, user) {
	if (err) throw err;
	if (!user) {
		bogdan.save(function(err) {
			if (err) throw err;
			console.log('bogdan user saved...');
		});
	} else {
		console.log('bogdan user already exists...');
	}
});