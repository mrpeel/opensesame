/*global require */

var gulp = require('gulp');
var replace = require('gulp-replace-task');
var fileinclude = require('gulp-file-include');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var connect = require('gulp-connect');
var ghPages = require('gulp-gh-pages');


gulp.task('default', ['buildstandalonehtml', 'appcachetimestamp', 'buildstandalonejs', 'minifycss', 'copytodist', 'copytodisttest', 'buildexthtml', 'buildextjs', 'minifyextcss', 'copytochromeext', 'copytodistchromeext']);

gulp.task('buildstandalonehtml', function () {
    gulp.src(['src/standalone-container.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./build/'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('appcachetimestamp', function () {
    gulp.src('src/opensesame.appcache.base')
        .pipe(replace({
            patterns: [
                {
                    match: 'timestamp',
                    replacement: new Date().getTime()
        }
      ]
        }))
        .pipe(rename('opensesame.appcache'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('buildstandalonejs', function () {
    return gulp.src(['src/passoff.js', 'src/manager.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('opensesame.js'))
        .pipe(gulp.dest('./build/'))
        .pipe(rename('opensesame.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/'));
});


gulp.task('minifycss', function () {
    return gulp.src(['src/style.css'])
        .pipe(rename('opensesame.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./build/'));
});

gulp.task('copytodist', function () {
    gulp.src(['./build/*.png', './build/*.ico', './build/*.js', './build/*.css', './build/*.html', './build/*.appcache'])
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copytodisttest', function () {
    gulp.src(['test/*.html', 'test/*.css', 'test/*.min.js', 'test/*.png'])
        .pipe(gulp.dest('./dist/test/'));
});

gulp.task('buildexthtml', function () {
    gulp.src(['src/ext-container.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename('opensesame.html'))
        .pipe(gulp.dest('./chrome-ext/'));
});


gulp.task('buildextjs', function () {
    return gulp.src(['src/passoff.js', 'src/manager.js', 'src/ext-popup.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('ext-opensesame.js'))
        .pipe(gulp.dest('./chrome-ext/'))
        .pipe(rename('ext-opensesame.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./chrome-ext/'))
        .pipe(gulp.dest('./chrome-ext/'));
});

gulp.task('minifyextcss', function () {
    return gulp.src(['src/style.css', 'src/ext-style.css'])
        .pipe(concat('ext-opensesame.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./chrome-ext/'));
});


gulp.task('copytochromeext', function () {
    gulp.src(['src/manifest.json', 'src/ext-background.js', 'src/ext-content.js', 'opensesame-38.png', 'src/material.min.js', 'src/material.min.css', 'pbkdf2.js', 'hmac-sha256.js', 'fonts/*.woff2'])
        .pipe(gulp.dest('./chrome-ext/'));
});

gulp.task('copytodistchromeext', function () {
    gulp.src(['src/manifest.json', 'src/ext-background.js', 'src/ext-content.js', 'opensesame-38.png', 'src/material.min.js', 'src/material.min.css', 'pbkdf2.js', 'hmac-sha256.js', 'fonts/*.woff2'])
        .pipe(gulp.dest('./dist/chrome-ext/'));

});



gulp.task('serve', function () {
    connect.server();
});


gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});
