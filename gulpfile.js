/*global require*/
var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});
var gulpif = require('gulp-if');
//var jshint = require('gulp-jshint');
//var jscs = require('gulp-jscs');
//var util = require('gulp-util');
//var gulpprint = require('gulp-print');
//var gulpif = require('gulp-if');
var port = process.env.PORT || config.defaultPort;

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
    /* jshint -W024, -W001, -W003, -W030, -W034  */
        .pipe(gulpif(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

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

gulp.task('wiredep', function () {
    'use strict';
    log('Wire up bower css js and app js into html');
    var options = config.getWiredepDefaultOptions(),
        wiredep = require('wiredep').stream;
    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles'], function () {
    'use strict';
    log('Wire up the app css into html and call wiredep');
    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

gulp.task('serve-dev', ['inject'], function () {
    'use strict';
    var isDev = true;
    var nodeOptions = {
        script: config.nodeServer,
        delaytime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        } ,
        watch: [config.server]
    };
    return $.nodemon(nodeOptions)
        .on('restart', ['vet'], function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart: \n' + ev);
        })
        .on('start', function () {
            log('*** nodemon started');
        })
        .on('crash', function () {
            log('*** nodemon crash');
        })
        .on('exit', function () {
            log('*** nodemon exit cleanly');
        });
});
