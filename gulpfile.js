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


/* Use a dependency chain to build in the correct order - starting with the final task.
    Each task has the dependcy of the previous task listed
*/
gulp.task('default', ['copytodistchromeext']);

/* Build the html for the stand alone website version of Open Sesame.
    Takes the container file and inserts the relevant @@include directives to build the complete page.
*/
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

/* Build the appcache file for the stand alone website version of Open Sesame.
    Updates the timestamp comment with the current date/time.  This is required to force a re-load of
    the cached files.
*/
gulp.task('appcachetimestamp', ['buildstandalonehtml'], function () {
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

/* Build the javascript for the stand alone website version of Open Sesame.
    Concatenates and minifies the files required to run as a stand-alone.
*/
gulp.task('buildstandalonejs', ['appcachetimestamp'], function () {
    gulp.src(['src/passoff.js', 'src/manager.js', 'src/cryptofunctions.js', 'src/temporaryphrasestore.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('opensesame.js'))
        .pipe(gulp.dest('./build/'))
        .pipe(rename('opensesame.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/'));
});

/* Minify the CSS used for Open Sesame (same is used for stand alone and chrome extension).
 */
gulp.task('minifycss', ['buildstandalonejs'], function () {
    gulp.src(['src/style.css'])
        .pipe(rename('opensesame.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./build/'));
});

/* Copy all the required files for stand alone operation to the dist directory.
 */
gulp.task('copytodist', ['minifycss'], function () {
    gulp.src(['./build/*.png', './build/*.ico', './build/*.js', './build/*.css', './build/*.html', './build/*.appcache'])
        .pipe(gulp.dest('./dist/'));
});

/* Minify the test spec file.
 */
gulp.task('minifytestspec', ['copytodist'], function () {
    gulp.src(['test/opensesame-spec.js'])
        .pipe(sourcemaps.init())
        .pipe(rename('opensesame-spec.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('test/'));
});

/* Copy the files required for running the test suite to the test directory.
 */
gulp.task('copytodisttest', ['minifytestspec'], function () {
    gulp.src(['test/*.html', 'test/*.css', 'test/*.min.js', 'test/*.png'])
        .pipe(gulp.dest('./dist/test/'));
});

/* Build the html for the chrome extension version of Open Sesame.
    Takes the container file and inserts the relevant @@include directives to build the complete page.
*/
gulp.task('buildexthtml', ['copytodisttest'], function () {
    gulp.src(['src/ext-container.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename('opensesame.html'))
        .pipe(gulp.dest('./chrome-ext/'));
});

/* Build the javascript file for pop-up page for the chrome extension.
    Concatenates and minifies the files required to run as a stand-alone.
*/
gulp.task('buildextjs', ['buildexthtml'], function () {
    gulp.src(['src/passoff.js', 'src/manager.js', 'src/ext-popup.js', 'src/cryptofunctions.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('ext-opensesame.js'))
        .pipe(gulp.dest('./chrome-ext/'))
        .pipe(rename('ext-opensesame.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./chrome-ext/'));
});

/* Concatenate the main css and specialised chrome extension css and minifies it.
 */

gulp.task('minifyextcss', ['buildextjs'], function () {
    gulp.src(['src/style.css', 'src/ext-style.css'])
        .pipe(concat('ext-opensesame.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the chrome-ext directory.
 */
gulp.task('copytochromeext', ['minifyextcss'], function () {
    gulp.src(['src/manifest.json', 'src/ext-background.js', 'src/ext-content.js', 'opensesame-38.png', 'src/material.min.js', 'src/material.min.css', 'src/cryptojs.js', 'fonts/*.woff2'])
        .pipe(gulp.dest('./chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the dist/chrome-ext directory.
 */
gulp.task('copytodistchromeext', ['copytochromeext'], function () {
    gulp.src(['src/*.json', 'src/ext-background.js', 'src/ext-content.js', 'chrome-ext/cryptojs.js', 'chrome-ext/*.png', 'chrome-ext/*.min.js', 'chrome-ext/*.min.css', 'chrome-ext/*.html', 'fonts/*.woff2'])
        .pipe(gulp.dest('./dist/chrome-ext/'));

});


/* Standard server task */
gulp.task('serve', function () {
    connect.server();
});


/* Task to deploy the built app to the github pages branch */
gulp.task('deploy', function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

/* Special task to build the three CyrptoJS files used into a single file */
gulp.task('buildcryptojs', function () {
    gulp.src(['src/aes.js', 'src/pbkdf2.js', 'src/hmac-sha256.js'])
        .pipe(concat('cryptojs.js'))
        .pipe(gulp.dest('./build/'));
});
