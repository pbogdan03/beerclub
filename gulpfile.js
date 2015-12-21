var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('default', function() {});

gulp.task('dev', function() {
	$.nodemon({
		script: 'server.js',
		ignore: 'public/',
		ext: 'js',
		watch: ['views/**/*', 'server.js'],
		env: {'NODE_ENV': 'development'}
	})
	.on('restart', function() {
		console.log('Server restarted!');
	});
});
