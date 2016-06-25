'use strict';

var gulp         = require('gulp');
var config       = require('./gulp.config')();
var del          = require('del');
var browserSync  = require('browser-sync').create();
var Pageres      = require('pageres');
var psi          = require('psi');
var runSequence  = require('run-sequence');

var $ = require('gulp-load-plugins')({
  lazy: true,
  scope: ['devDependencies'],
  rename: {
    'gulp-ruby-sass': 'sass'
  }
});

// List all tasks
gulp.task('help', $.taskListing);

// add file header
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version: v<%= pkg.version %>',
  ' * @link: <%= pkg.homepage %>',
  ' * @author: <%= pkg.author %>',
  ' */',
  ''].join('\n');

// Remove sourcemaps on production
gulp.task('clean', function(cb) {
  del(config.sourceMaps, cb);
});

/* Sass */
// Compile my Sass
gulp.task('sass', function () {
  return $.sass(config.cssInput, { style: 'expanded', sourcemap: true, noCache: true })
    .pipe($.plumber())
    .pipe($.autoprefixer(config.autoprefixerOptions))
    .pipe($.sourcemaps.write('.'))
    .pipe($.size({title: 'CSS'}))
    .pipe(gulp.dest(config.cssOutput))
    .pipe(browserSync.stream());
});

// Minify CSS for production
gulp.task('minify-css', ['clean'], function () {
  return $.sass(config.cssInput, { style: 'expanded', sourcemap: false, noCache: true })
    .pipe($.plumber())
    .pipe($.autoprefixer(config.autoprefixerOptions))
    .pipe($.csscomb())
    .pipe($.minifyCss())
    .pipe($.header(banner, { pkg : pkg } ))
    .pipe($.size({title: 'CSS.min'}))
    .pipe(gulp.dest(config.cssOutput))
    .pipe(browserSync.stream());
});

/* Js */

// Lint JavaScript
gulp.task('lintJs', function(){
  gulp.src(config.buildJs)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
});

// Basic js concat and error-check
gulp.task('js', function() {
  gulp.src(config.jsInput)
    .pipe($.concat('application.js'))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest(config.jsOutput))
    .pipe(browserSync.stream());
});

// Minify js for production
gulp.task('minify-js', ['clean'], function() {
  return gulp.src(config.jsInput)
    .pipe($.concat('application.js'))
    .pipe($.uglify({ mangle: true }))
    .pipe($.header(banner, { pkg : pkg } ))
    .pipe($.size({title: 'scripts.min'}))
    .pipe(gulp.dest(config.jsOutput))
    .pipe(browserSync.stream());
});

// Optimize images
gulp.task('img', function() {
  return gulp.src(config.jpgSource)
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true
    })))
    .pipe(gulp.dest(config.imgOutput));
});

// Take screenshots of the website on any resolution
gulp.task('shoot', function () {
  var pageres = new Pageres({delay: 2})
    .src('index.html', ['480x320', 'iphone 5s'])
    .dest('./doc/test-img');
  pageres.run(function (err) {
    if (err) {
        throw err;
    }
    $.util.log($.util.colors.blue('Screenshots taken'));
  });
});

// Analyze your CSS
gulp.task('css-stat', function () {
  return gulp.src(config.cssStat)
    .pipe($.stylestats());
});

// Test website on Google PageSpeed
gulp.task('mobile-test', function () {
    return psi(config.site, {
        // key: config.key
        nokey: 'true',
        strategy: 'mobile',
    }, function (err, data) {
        $.util.log($.util.colors.green(data.score));
        $.util.log($.util.colors.red(JSON.stringify(data.pageStats)));
    });
});

gulp.task('desktop-test', function () {
    return psi(config.site, {
        nokey: 'true',
        // key: config.key,
        strategy: 'desktop',
    }, function (err, data) {
        $.util.log($.util.colors.green(data.score));
        $.util.log($.util.colors.red(JSON.stringify(data.pageStats)));
    });
});

// Watch for changes, BrowserSync
gulp.task('watch', function() {
  browserSync.init({
    server: {
      baseDir: config.baseDir
    },
    notify: false
  });
  gulp.watch(config.cssWatch, ['sass']).on('change', function(event) {
    $.util.log($.util.colors.green('File ' + event.path + ' was ' + event.type + ', running tasks...'));
  });
  gulp.watch(config.jsInput, ['lintJs', 'js']).on('change', function(event) {
    $.util.log($.util.colors.yellow('File ' + event.path + ' was ' + event.type + ', running tasks...'));
  });
  gulp.watch("./*.html").on('change', browserSync.reload);
  gulp.watch(config.imgSource, ['img']).on('change', function(event) {
    $.util.log($.util.colors.blue('File ' + event.path + ' was ' + event.type + ', running tasks...'));
  });
});

/* StyleGuide */
// Copy css files from the project directory
gulp.task('styleguide:copy-css', function() {
  return gulp.src(config.style_copyCssInput)
    .pipe(gulp.dest(config.style_copyCssOutput));
});
// Copy js files from the project directory
gulp.task('styleguide:copy-js', function() {
  return gulp.src(config.style_copyJsInput)
    .pipe($.rename('1-application.js'))
    .pipe(gulp.dest(config.style_copyJsOutput));
});

gulp.task('styleguide:copy-assets', function() {
  return gulp.src(['./fonts/**/*', './icons/**/*', './img/**/*'], { base: './' })
    .pipe(gulp.dest('./temp'))
});

gulp.task('styleguide:copy-icons', function() {
  return gulp.src('./icons/**/*')
    .pipe(gulp.dest('./doc/styleguide/assets/icons/'))
});

// Create a zip file of the assets, ready to be downloaded
gulp.task('zip', function() {
  return gulp.src('./temp/**/*', { base: './' })
    .pipe($.zip('assets-archive.zip'))
    .pipe($.size({title: 'zip.styleguide'}))
    .pipe(gulp.dest('./doc/styleguide/assets/'))
});

gulp.task('clean:assets', function(cb) {
  del(['./temp'], cb);
});

gulp.task('dw-assets', function() {
  runSequence(
    'styleguide:copy-assets',
    'zip',
    'clean:assets'
  );
});

// Execute css & js compilation/concatenation
gulp.task('sass:styleguide', function() {
  return $.sass(config.style_cssInput, { style: 'expanded', noCache: true })
    .pipe($.plumber())
    .pipe($.autoprefixer(config.autoprefixerOptions))
    .pipe($.csscomb())
    .pipe($.minifyCss())
    .pipe($.header(banner, { pkg : pkg } ))
    .pipe($.size({title: 'CSS.styleguide'}))
    .pipe(gulp.dest(config.style_cssOutput))
    .pipe(browserSync.stream());
});

gulp.task('js:styleguide', function() {
  return gulp.src(config.style_jsInput)
    .pipe($.concat('application.js'))
    .pipe($.size({title: 'scripts.styleguide'}))
    .pipe(gulp.dest(config.style_jsOutput))
    .pipe(browserSync.stream());
});

// Copy project files to the styleguide directory
gulp.task('make-styleguide', function() {
  runSequence(
    'styleguide:copy-icons',
    'dw-assets',
    ['styleguide:copy-css',
    'styleguide:copy-js']
  );
});

gulp.task('styleguide', ['make-styleguide', 'sass:styleguide', 'js:styleguide'], function() {
  browserSync.init({
    server: {
      baseDir: config.style_baseDir
    }
  });
  gulp.watch(config.style_cssWatch, ['sass:styleguide']).on('change', function(event) {
    $.util.log($.util.colors.green('File ' + event.path + ' was ' + event.type + ', running tasks...'));
  });
  gulp.watch(config.style_jsWatch, ['js:styleguide']).on('change', function(event) {
    $.util.log($.util.colors.yellow('File ' + event.path + ' was ' + event.type + ', running tasks...'));
  });
  gulp.watch("./doc/styleguide/*.html").on('change', browserSync.reload);
});

// Production workflow: minify assets & generate documentation
gulp.task('production', function() {
  runSequence(
    ['lintJs', 'minify-css', 'minify-js'],
    'clean',
    'make-styleguide',
    'img',
    'css-stat');
});
// Analysis Task
gulp.task('analyse', function() {
  runSequence(
    'css-stat',
    'mobile-test',
    'desktop-test',
    'shoot');
});
// Default Task
gulp.task('default', ['sass', 'lintJs', 'js', 'watch']);
