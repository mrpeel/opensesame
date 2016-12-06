/* global require */

let gulp = require('gulp');
let replace = require('gulp-replace-task');
let fileinclude = require('gulp-file-include');
let rename = require('gulp-rename');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let nano = require('gulp-cssnano');
let connect = require('gulp-connect');
let ghPages = require('gulp-gh-pages');
let gutil = require('gulp-util');
let debug = require('gulp-debug');
let htmlmin = require('gulp-htmlmin');


/* Use a dependency chain to build in the correct order - starting with the
  final task.
  Each task has the dependcy of the previous task listed
*/
gulp.task('default', ['watch']);

/* Build the serviceworker js file for build directory. Updates the timestamp
 * used in the cache name the current date/time.
 */
gulp.task('buildserviceworker', function() {
  gulp.src('src/sw.js')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: new Date().getTime(),
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'cssfile',
        replacement: 'opensesame.css',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'assert-jsref',
        replacement: 'simple_assert.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'opensesame-jsref',
        replacement: 'opensesame.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'crypto-jsref',
        replacement: 'cryptfunctions.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.js',
      }],
    }))
    .pipe(gulp.dest('build/'));
});


/* Build the serviceworker js file for dist directory. Updates the timestamp
*  used in the cache name the current date/time.
*/
gulp.task('distserviceworker', ['buildserviceworker'], function() {
  gulp.src('src/sw.js')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: new Date().getTime(),
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'cssfile',
        replacement: 'opensesame.min.css',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'assert-jsref',
        replacement: 'simple_assert.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'opensesame-jsref',
        replacement: 'opensesame.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'crypto-jsref',
        replacement: 'cryptfunctions.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.min.js',
      }],
    })).pipe(gulp.dest('dist/'));
});

/* Build the html for the stand alone website version of Open Sesame.
 *  Takes the container file and inserts the relevant @@include directives
 *  to build the complete page.
*/
gulp.task('buildstandalonehtml', ['distserviceworker'], function() {
  gulp.src(['src/standalone-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(replace({
      patterns: [{
        match: 'assert-jsref',
        replacement: 'simple_assert.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'opensesame-jsref',
        replacement: 'opensesame.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'crypto-jsref',
        replacement: 'cryptfunctions.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.js',
      }],
    }))
    .pipe(htmlmin({
      collapseWhitespace: false,
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./build/'));


  gulp.src(['src/standalone-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(replace({
      patterns: [{
        match: 'assert-jsref',
        replacement: 'simple_assert.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'opensesame-jsref',
        replacement: 'opensesame.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'crypto-jsref',
        replacement: 'cryptfunctions.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.min.js',
      }],
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist/'));
});

/* Minify the javascript for the stand alone website and extension versions
* version of Open Sesame.
*/
gulp.task('copybuildjs', ['buildstandalonehtml'], function() {
  gulp.src(['src/simple_assert.js', 'src/passoff.js', 'src/manager.js',
    'src/cryptofunctions.js', 'src/temporaryphrasestore.js',
  ])
    .pipe(gulp.dest('./build/'))
    .pipe(gulp.dest('./chrome-ext/'));

  gulp.src(['ext-popup.js'])
    .pipe(gulp.dest('./chrome-ext/'));
});


/* Minify the javascript for the stand alone website and extension versions
* version of Open Sesame.
*/
gulp.task('minifyjs', ['copybuildjs'], function() {
  gulp.src(['src/simple_assert.js'])
    .pipe(rename('simple_assert.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['src/opensesame.js'])
    .pipe(rename('opensesame.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['src/manager.js'])
    .pipe(rename('manager.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['src/cryptofunctions.js'])
    .pipe(rename('cryptofunctions.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['src/temporaryphrasestore.js'])
    .pipe(rename('temporaryphrasestore.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['src/cryptofunctions.js'])
    .pipe(rename('cryptofunctions.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));

  gulp.src(['ext-popup.js'])
    .pipe(rename('ext-popup.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Minify the CSS used for Open Sesame (same is used for stand alone and
 * chrome extension).
 */
gulp.task('minifycss', ['minifyjs'], function() {
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
  gulp.src(['./build/*.css', './build/*.html'])
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
 * Takes the container file and inserts the relevant @@include directives to
 * build the complete page.
*/
gulp.task('buildexthtml', ['copytodisttest'], function() {
  gulp.src(['src/ext-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: 'ext-opensesame.js',
      }],
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./chrome-ext/'));

  gulp.src(['src/ext-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(replace({
      patterns: [{
        match: 'jsref',
        replacement: 'ext-opensesame.min.js',
      }],
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Build the javascript file for pop-up page for the chrome extension.
    Concatenates and minifies the files required to run as a stand-alone.
*/
gulp.task('buildextjs', ['buildexthtml'], function() {
  gulp.src(['src/simple_assert.js', 'src/temporaryphrasestore.js',
    'src/passoff.js', 'src/manager.js', 'src/ext-popup.js',
    'src/cryptofunctions.js',
  ])
    .pipe(debug())
    .pipe(concat('ext-opensesame.js'))
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(rename('ext-opensesame.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Concatenate the main css and specialised chrome extension css and minifies
 *  it.
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
  let dateOffset = 4032271;
  let dateCalc = parseInt(new Date().getTime() / 360000);

  gulp.src('src/manifest.json')
    .pipe(replace({
      patterns: [{
        match: 'timestamp',
        replacement: String(parseInt((dateCalc - dateOffset) / 1000)) +
          '.' + String((dateCalc - dateOffset) % 1000),
      }],
    }))
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/'))
    .pipe(gulp.dest('./dist/chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the
 *  chrome-ext directory.
 */
gulp.task('copytochromeext', ['buildmanifestfiles'], function() {
  gulp.src(['src/ext-background.js', 'src/ext-content.js',
    'src/opensesame-38.png', 'lib/material.min.js',
    'lib/material.min.css', 'src/cryptojs.js', 'fonts/*.woff2',
  ])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/'));
});

/* Copy all the required files for chrome extension operation to the
 *  dist/chrome-ext directory.
 */
gulp.task('copytodistchromeext', ['copytochromeext'], function() {
  gulp.src(['src/ext-background.js', 'src/ext-content.js',
    'chrome-ext/cryptojs.js', 'chrome-ext/*.png', 'lib/material.min.js',
    'lib/material.min.css', 'fonts/*.woff2',
  ])
    .pipe(debug())
    .pipe(gulp.dest('./dist/chrome-ext/'));
});


gulp.task('watch', ['copytodistchromeext'], function() {
  // Execute the html task anytime the source files change
  gulp.watch('src/*.*', ['html']);
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
    livereload: true,
  });

  // Execute the html task anytime the source files change
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
