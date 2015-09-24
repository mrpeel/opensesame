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



gulp.task('default', ['buildstandalonehtml', 'appcachetimestamp', 'buildjs', 'minifycss', 'copytodist']);

gulp.task('buildstandalonehtml', function () {
    gulp.src(['src/standalone-container.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'))
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
        .pipe(gulp.dest('./'));
});

gulp.task('buildjs', function () {
    return gulp.src(['src/passoff.js', 'src/manager.js'])
        .pipe(concat('opensesame.js'))
        .pipe(sourcemaps.init())
        .pipe(gulp.dest('./'))
        .pipe(rename('opensesame.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
});


gulp.task('minifycss', function () {
    return gulp.src(['src/style.css'])
        .pipe(rename('opensesame.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./'));
});

gulp.task('copytodist', function () {
    gulp.src(['./*.png', './*.ico', './*.js', './*.css', './*.html', './*.appcache'])
        .pipe(gulp.dest('./dist/'));
});



gulp.task('serve', function () {
    connect.server();
});
