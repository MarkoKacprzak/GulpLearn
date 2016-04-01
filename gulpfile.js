/*global require*/
var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});

//var jshint = require('gulp-jshint');
//var jscs = require('gulp-jscs');
//var util = require('gulp-util');
//var gulpprint = require('gulp-print');
//var gulpif = require('gulp-if');

function log(msg) {
    'use strict';
    var item;
    if (typeof (msg) === 'object') {
        for (item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.green(msg));
    }
}
//gulp vet --verbose
gulp.task('vet', function () {
    'use strict';
    log('Analyzing source with JSHint and JSCS');
    
    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

function errorLogger(error) {
    log('Start of Error');
    log(error);
    log('End of Error');
    this.emit('end');
}


gulp.task('styles', ['clean-styles'], function () {
    'use strict';
    log('Compile Less --->CSS');
    
    return gulp
        .src(config.less) //TODO
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

function clean(path, done) {
    'use strict';
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path).then(done());
}

gulp.task('clean-styles', function (done) {
    'use strict';
    log('Clean files');
    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('less-watcher', function () {
    'use strict';
    gulp.watch([config.less], ['styles']);
});
