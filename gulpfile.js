/*global require */

var gulp = require('gulp');
var replace = require('gulp-replace-task');
var fileinclude = require('gulp-file-include');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var nano = require('gulp-cssnano');
var connect = require('gulp-connect');
var ghPages = require('gulp-gh-pages');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var htmlmin = require('gulp-htmlmin');


/* Use a dependency chain to build in the correct order - starting with the final task.
    Each task has the dependcy of the previous task listed
*/
//gulp.task('default', ['copytodistchromeext']);
gulp.task('default', ['serve']);

/* Build the serviceworker js file for build directory. Updates the timestamp used in the cache name the current date/time.
 */
gulp.task('buildserviceworker', function() {
  gulp.src('src/sw.js')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: new Date().getTime()
      }]
    }))
    .pipe(replace({
      patterns: [{
        match: 'cssfile',
        replacement: 'opensesame.css'
      }]
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsfile',
        replacement: 'opensesame.js'
      }]
    }))

  .pipe(gulp.dest('build/'));
});


/* Build the serviceworker js file for dist directory. Updates the timestamp used in the cache name the current date/time.
 */
gulp.task('distserviceworker', ['buildserviceworker'], function() {
  gulp.src('src/sw.js')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: new Date().getTime()
      }]
    }))
    .pipe(replace({
      patterns: [{
        match: 'cssfile',
        replacement: 'opensesame.min.css'
      }]
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsfile',
        replacement: 'opensesame.min.js'
      }]
    }))

  .pipe(gulp.dest('dist/'));
});

/* Build the html for the stand alone website version of Open Sesame.
    Takes the container file and inserts the relevant @@include directives to build the complete page.
*/
gulp.task('buildstandalonehtml', ['distserviceworker'], function() {
  gulp.src(['src/standalone-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: "opensesame.js"
      }]
    }))
    .pipe(htmlmin({
      collapseWhitespace: false
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./build/'));


  gulp.src(['src/standalone-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: "opensesame.js"
      }]
    }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist/'));
});

/* Build the appcache file for the stand alone website version of Open Sesame.
    Updates the timestamp comment with the current date/time.  This is required to force a re-load of
    the cached files.
*/
/*
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
});*/

/* Build the javascript for the stand alone website version of Open Sesame.
    Concatenates and minifies the files required to run as a stand-alone.
*/
gulp.task('buildstandalonejs', ['buildstandalonehtml'], function() {
  gulp.src(['src/passoff.js', 'src/manager.js', 'src/cryptofunctions.js',
      'src/temporaryphrasestore.js'
    ])
    .pipe(concat('opensesame.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(rename('opensesame.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('build/'));
});

/* Minify the CSS used for Open Sesame (same is used for stand alone and chrome extension).
 */
gulp.task('minifycss', ['buildstandalonejs'], function() {
  gulp.src(['src/style.css'])
    .pipe(rename('opensesame.css'))
    .pipe(gulp.dest('./build/'))
    .pipe(rename('opensesame.min.css'))
    .pipe(nano()).on('error', gutil.log)
    .pipe(gulp.dest('./build/'));
});

/* Copy the MDL files from source to build
 */
gulp.task('copymaterial', ['minifycss'], function() {
  gulp.src(['lib/material.min.js', 'lib/material.min.css'])
    .pipe(gulp.dest('./build/'))
    .pipe(gulp.dest('./dist/'));
});

/* Copy the favicon files
 */
gulp.task('copyfavicon', ['copymaterial'], function() {
  gulp.src(['src/*.png', 'src/*.ico'])
    .pipe(debug())
    .pipe(gulp.dest('./build/'))
    .pipe(gulp.dest('./dist/'));
});



/* Copy all the required files for stand alone operation to the dist directory.
 */
gulp.task('copytodist', ['copyfavicon'], function() {
  gulp.src(['./build/*.js', './build/*.css', './build/*.html'])
    .pipe(debug())
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});

/* Minify the test spec file.
 */
gulp.task('minifytestspec', ['copytodist'], function() {
  gulp.src(['test/opensesame-spec.js'])
    .pipe(rename('opensesame-spec.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('test/'));
});

/* Copy the files required for running the test suite to the test directory.
 */
gulp.task('copytodisttest', ['minifytestspec'], function() {
  gulp.src(['test/*.html', 'test/*.css', 'test/*.min.js', 'test/*.png'])
    .pipe(debug())
    .pipe(gulp.dest('./dist/test/'));
});

/* Build the html for the chrome extension version of Open Sesame.
    Takes the container file and inserts the relevant @@include directives to build the complete page.
*/
gulp.task('buildexthtml', ['copytodisttest'], function() {
  gulp.src(['src/ext-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: "ext-opensesame.js"
      }]
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./chrome-ext/'));

  gulp.src(['src/ext-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: "ext-opensesame.min.js"
      }]
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

});

/* Build the javascript file for pop-up page for the chrome extension.
    Concatenates and minifies the files required to run as a stand-alone.
*/
gulp.task('buildextjs', ['buildexthtml'], function() {
  gulp.src(['src/temporaryphrasestore.js', 'src/passoff.js',
      'src/manager.js', 'src/ext-popup.js', 'src/cryptofunctions.js'
    ])
    .pipe(debug())
    .pipe(concat('ext-opensesame.js'))
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(rename('ext-opensesame.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Concatenate the main css and specialised chrome extension css and minifies it.
 */

gulp.task('minifyextcss', ['buildextjs'], function() {
  gulp.src(['src/style.css', 'src/ext-style.css'])
    .pipe(debug())
    .pipe(concat('ext-opensesame.min.css'))
    .pipe(nano()).on('error', gutil.log)
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Build manifest file
 */
gulp.task('buildmanifestfiles', ['minifyextcss'], function() {
  var dateOffset = 4032271;
  var dateCalc = parseInt(new Date().getTime() / 360000);

  gulp.src('src/manifest.json')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: String(parseInt((dateCalc - dateOffset) / 1000)) +
          '.' + String((dateCalc - dateOffset) % 1000)
      }]
    }))
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the chrome-ext directory.
 */
gulp.task('copytochromeext', ['buildmanifestfiles'], function() {
  gulp.src(['src/ext-background.js', 'src/ext-content.js',
      'src/opensesame-38.png', 'lib/material.min.js',
      'lib/material.min.css', 'src/cryptojs.js', 'fonts/*.woff2'
    ])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the dist/chrome-ext directory.
 */
gulp.task('copytodistchromeext', ['copytochromeext'], function() {
  gulp.src(['src/ext-background.js', 'src/ext-content.js',
      'chrome-ext/cryptojs.js', 'chrome-ext/*.png', 'lib/material.min.js',
      'lib/material.min.css', 'fonts/*.woff2'
    ])
    .pipe(debug())
    .pipe(gulp.dest('./dist/chrome-ext/'));

});


/* Watch for changes to html and then reload when updated
 */
gulp.task('html', ['copytodistchromeext'], function() {
  gulp.src('./build/*.html')
    .pipe(connect.reload());
});

/* Standard server task */
gulp.task('serve', ['copytodistchromeext'], function() {
  connect.server({
    root: 'dist',
    livereload: true
  });

  //Execute the html task anytime the source files change
  gulp.watch('src/*.*', ['html']);
});


/* Task to deploy the built app to the github pages branch */
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

/* Special task to build the three CyrptoJS files used into a single file */
gulp.task('buildcryptojs', function() {
  gulp.src(['lib/aes.js', 'lib/pbkdf2.js', 'lib/hmac-sha256.js'])
    .pipe(debug())
    .pipe(concat('cryptojs.js'))
    .pipe(gulp.dest('./build/'));
});
