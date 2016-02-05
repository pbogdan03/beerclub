var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
try {
	var dotenv = require('dotenv');
	dotenv.load();
} catch (err) {
	console.log('----------- no dotenv module (no problem) -----------');
}

var passport = require('./auth');
var routes = require('./routes/routes');
var dbURL = require('./db/config');
require('./controller/schedule');

var env = process.env.NODE_ENV || 'development';

var app = express();
var store = new MongoDBStore({
	uri: dbURL,
	collection: 'mongoSession'
});

store.on('error', function(err) {
	console.error(err);
});

// set handlebars as the view engine
var handlebars = require('express-handlebars').create();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

app.use(favicon(path.join(__dirname, './../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
	secret: 'test',
	saveUninitialized: true,
	resave: true,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
	},
	store: store
}));
app.use(passport.initialize());
app.use(passport.session());
if (env === 'development') {
	app.use(require('connect-livereload')());
}
app.use(express.static(path.join(__dirname, './../public')));

app.use(routes);

// app.get('/headers', function(req, res) {
// 	res.set('Content-Type', 'text/plain');
// 	var s = '';
// 	for (var name in req.headers) {
// 		s += name + ': ' + req.headers[name] + '\n';
// 	}
// 	res.send(s);
// });

// 404 catch and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
// will print stacktrace
if (env === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
