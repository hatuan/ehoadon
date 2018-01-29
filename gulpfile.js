var gulp = require('gulp'),
    del = require('del'),
    util     = require('gulp-util'),
    notifier = require('node-notifier'),
    child    = require('child_process'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    uglify = require('gulp-uglify'),
    minifyHtml = require("gulp-minify-html"),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate');
    
var CacheBuster = require('gulp-cachebust');
var cachebust = new CacheBuster();
/////////////////////////////////////////////////////////////////////////////////////
//
// cleans the build output
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function () {
    return del(['dist']);
});

/////////////////////////////////////////////////////////////////////////////////////
//
// runs sass, creates css source maps
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build-css', function () {
    return gulp.src('./static/styles/**/*')
        .pipe(cachebust.resources())
        .pipe(gulp.dest('./dist/static/styles'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// fills in the Angular template cache, to prevent loading the html templates via
// separate http requests
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build-template-cache', ['clean'], function () {

    var ngHtml2Js = require("gulp-ng-html2js"),
        concat = require("gulp-concat");

    return gulp.src("./partials/*.html")
        .pipe(ngHtml2Js({
            moduleName: "todoPartials",
            prefix: "/partials/"
        }))
        .pipe(concat("templateCachePartials.js"))
        .pipe(gulp.dest("./dist"));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// runs jshint
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('jshint', function () {
    gulp.src('./static/app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Build a minified Javascript bundle - the order of the js files is determined
// by browserify
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build-js', function () {
    var jsFiles= [
        './static/app/**/*.js'
    ];

    return gulp.src(jsFiles)
        .pipe(ngAnnotate()) //ngAnnotate() before uglify!
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('./dist/static/app'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Build a minified HTML
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build-html', function () {
    var htmlFiles= [
        './static/app/**/*.html'
    ];

    return gulp.src(htmlFiles)
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(gulp.dest('./dist/static/app'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// Copy other file
//
/////////////////////////////////////////////////////////////////////////////////////
gulp.task('copy', function () {
    return gulp.src(['settings/**/*', 
            '!settings/**/*.go', 
            'static/favicon.ico', 
            'static/index.html', 
            'static/main.js', 
            'static/assets/**/*', 
            'static/bower_components/**/*', 
            'static/jsons/**/*', 
            'static/l10n/**/*', 
            'static/reports/**/*', 
            'static/scripts/**/*', 
            'static/styles/**/*',
            'db/migrations/*', 
            'goose'], {
        base:"."
    })
    .pipe(gulp.dest('./dist'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// server:build
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('server:build', function() {
    process.env['CGO_ENABLED'] = 0;
    process.env['GOOS'] = 'linux';

    var build =  child.exec('go build -ldflags "-w -s" -a -installsuffix cgo -o ./dist/ehoadon', function(err, stdout, stderr) {

        // Something wrong
        if (stderr.length) {
            util.log(util.colors.red('Something wrong with this version :'));
            var lines = stderr.toString()
                .split('\n').filter(function(line) {
                                return line.length
                            });
        
            for (var l in lines)
                util.log(util.colors.red(
                    'Error (go build): ' + lines[l]
                ));
                notifier.notify({
                    title: 'Error (go build)',
                    message: lines
                });
        }
    });
    
    return build;
});

/////////////////////////////////////////////////////////////////////////////////////
//
// full build (except sprites), applies cache busting to the main page css and js bundles
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('build', ['jshint', 'build-js', 'build-html', 'copy'], function () {
    return gulp.src(['./static/index.html'])
        .pipe(cachebust.references())
        .pipe(gulp.dest('./dist/static'));
});

/////////////////////////////////////////////////////////////////////////////////////
//
// installs and builds everything, including sprites
//
/////////////////////////////////////////////////////////////////////////////////////

gulp.task('default', ['clean'], function () {
    gulp.start(['build'], ['server:build']);
});