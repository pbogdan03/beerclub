var express = require('express');
var	mongoose = require('mongoose'); //dbuser: bogdanp, dbpass: clubbingb33r

mongoose.connect('mongodb://bogdanp:clubbingb33r@ds033175.mongolab.com:33175/beerclubdb', function(err) {
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

var app = express();

// set handlebars as the view engine
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('home');
});

// 404 catch-all (middleware)
app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500);
	res.render('500');
});

// start the server
app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
