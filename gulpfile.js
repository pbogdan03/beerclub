var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
require('colors');
var lr = require('tiny-lr')();
var $ = require('gulp-load-plugins')();

gulp.task('default', ['nodemon'], function() {});

gulp.task('nodemon', ['styles', 'browserify', 'html'], function(cb) {
	lr.listen(35729, function() {
		console.log('--->>> Tiny-lr listens on: 35729'.white);
	});

	var started = false;
	$.nodemon({
		script: './bin/www',
		watch: ['server/**/*.*', 'bin/www', 'server/index.js']
	}).on('start', function() {
		//to avoid nodemon being started multiple times
		console.log('--->>> Server started!'.white);
		if (!started) {
			cb();
			started = true;
		}
	}).on('restart', function() {
		console.log('--->>> Server restarted!'.white);
	});

	gulp.watch('./client/styles/*.scss', ['styles']);
	gulp.watch('./client/scripts/**/*.js', ['browserify']);
	gulp.watch('./client/*.html', ['html']);
	gulp.watch(['public/**'], reloadNotify);
});

gulp.task('styles', function() {
	return gulp.src('./client/styles/*.scss')
		.pipe($.sass())
		.pipe(gulp.dest('./public/styles'));
});

/**
 * useref uses(if it exists):
 * <!-- build:js js/main.min.js -->
 * <!-- endbuild -->
 **/
gulp.task('html', function() {
	return gulp.src('./client/index.html')
		.pipe($.useref())
		.pipe(gulp.dest('./public'));
});

gulp.task('scripts', function() {
	return gulp.src('./client/scripts/**/*.js')
		.pipe($.concat('main.min.js'))
		.pipe($.uglify())
		.pipe(gulp.dest('./public'));
});

gulp.task('browserify', function() {
	return browserify('./client/scripts/scripts.js')
		.bundle()
		//desired output filename
		.pipe(source('main.js'))
		.pipe(buffer())
		.pipe($.uglify())
		.pipe(gulp.dest('./public'));
});

/**
 ***********************************************
 *	Helper functions
 ***********************************************
 */

function reloadNotify(ev) {
	var fileName = require('path').relative(__dirname, ev.path);

	lr.changed({
		body: {
			files: [fileName]
		}
	});
}
