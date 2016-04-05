/*global require,process*/
var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
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
gulp.task('help', $.taskListing);

gulp.task('default', ['help']);
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

gulp.task('fonts', ['clean-fonts'], function () {
    'use strict';
    log('Copying fonts');
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'], function () {
    'use strict';
    log('Copying and compressing the images');
    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'));
});

function clean(path, done) {
    'use strict';
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path).then(done());
}

gulp.task('clean', function (done) {
    'use strict';
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

gulp.task('clean-fonts', function (done) {
    'use strict';
    clean(config.build + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function (done) {
    'use strict';
    clean(config.build + 'images/**/*.*', done);
});

gulp.task('clean-styles', function (done) {
    'use strict';
    clean(config.temp + '**/*.css', done);
});

gulp.task('clean-code', function (done) {
    'use strict';
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files, done);
});

gulp.task('less-watcher', function () {
    'use strict';
    gulp.watch([config.less], ['styles']);
});

gulp.task('templatecache', ['clean-code'], function () {
    'use strict';
    log('Creating AngularJS $templateCache');
    var options = config.getWiredepDefaultOptions(),
        wiredep = require('wiredep').stream;
    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        //gulp-angular-templatecache
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
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

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    'use strict';
    log('Wire up the app css into html and call wiredep');
    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

function changeEvent(event) {
    'use strict';
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev) {
    'use strict';
    if (args.nosync || browserSync.active) {
        return;
    }
    log('Starting browser-sync on port' + port);
    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', function (event) { changeEvent(event); });
    } else {
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function (event) { changeEvent(event); });
    }
    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    };
    browserSync(options);
}

gulp.task('optimize', ['inject'], function () {
    'use strict';
    log('Optimizing the javascript, css, html');
    var templateCache = config.temp + config.templateCache.file;
    log(templateCache);
    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates:js -->'
        }))
        .pipe($.useref({searchPath: './'}))
        .pipe(gulp.dest(config.build));
});

function serve(isDev) {
    'use strict';
    var nodeOptions = {
            script: config.nodeServer,
            delaytime: 1,
            env: {
                'PORT': port,
                'NODE_ENV': isDev ? 'dev' : 'build'
            },
            watch: [config.server]
        };
    return $.nodemon(nodeOptions)
        .on('restart', ['vet'], function (ev) {
            log('*** nodemon restarted');
            log('files changed on restart: \n' + ev);
            setTimeout(function () {
                browserSync.notify('reloading now...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function () {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function () {
            log('*** nodemon crash');
        })
        .on('exit', function () {
            log('*** nodemon exit cleanly');
        });
}

gulp.task('serve-build', ['optimize'], function () {
    'use strict';
    serve(false);
});

gulp.task('serve-dev', ['inject'], function () {
    'use strict';
    serve(true);
});
