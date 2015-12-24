var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var env = process.env.NODE_ENV || 'development';

var routes = require('./routes/index');

require('./config/db');

var app = express();

// set handlebars as the view engine
var handlebars = require('express-handlebars').create();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

app.use(favicon(path.join(__dirname, './../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

if ('development' === env) {
	app.use(require('connect-livereload')());
}

app.use(express.static(path.join(__dirname, './../public')));

app.use('/', routes);

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
if (app.get('env') === 'development') {
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
