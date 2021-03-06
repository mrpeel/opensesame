/* global require */

const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace-task');
const fileinclude = require('gulp-file-include');
const rename = require('gulp-rename');
const regexRename = require('gulp-regex-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const nano = require('gulp-cssnano');
const connect = require('gulp-connect');
const ghPages = require('gulp-gh-pages');
const gutil = require('gulp-util');
const debug = require('gulp-debug');
const htmlmin = require('gulp-htmlmin');

/* Use a dependency chain to build in the correct order - starting with the
  final task.
  Each task has the dependcy of the previous task listed
*/
gulp.task('default', ['watch']);

/* Clean the target directories prior to building the files
 */
gulp.task('clean', function() {
  return del([
    './build/**/*',
    './name-cache/**/*',
    './dist/**/*',
    './chrome-ext/**/*',
  ]);
});

/* Build the serviceworker js file for build directory. Updates the timestamp
 * used in the cache name the current date/time.
 */
gulp.task('buildserviceworker', ['clean'], function() {
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
        match: 'os-jsref',
        replacement: 'os.js',
      }],
    }))
    .pipe(gulp.dest('./build/'));
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
        match: 'os-jsref',
        replacement: 'os.min.js',
      }],
    }))
    .pipe(gulp.dest('./dist/'));
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
        match: 'os-jsref',
        replacement: 'os.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'oscss',
        replacement: 'opensesame.css',
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
        match: 'os-jsref',
        replacement: 'os.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'oscss',
        replacement: 'opensesame.min.css',
      }],
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist/'));
});

/* Minify the javascript for the stand alone website and extension versions
*  of Open Sesame for the dist directories.
*/
gulp.task('copyandminifyjs', ['buildstandalonehtml'], function() {
  // Copy then minify the individual stand alone and extension files
  gulp.src(['src/simple_assert.js', 'src/cryptofunctions.js',
    'src/temporaryphrasestore.js', 'src/opensesame.js', 'src/fb-auth.js',
    'src/manager.js'])
    .pipe(concat('os.js'))
    .pipe(gulp.dest('./build/scripts/'))
    .pipe(regexRename(/\.js$/, '.min.js').on('error', gutil.log))
    .pipe(debug())
    .pipe(uglify({
      'warnings': true,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'));

  /* Copy then minify the js file for the chrome extension */
  gulp.src(['src/simple_assert.js', 'src/cryptofunctions.js',
    'src/temporaryphrasestore.js', 'src/opensesame.js', 'src/fb-auth.js',
    'src/manager.js', 'src/ext-popup.js'])
    .pipe(concat('os.js'))
    .pipe(gulp.dest('./chrome-ext/build/scripts/'))
    .pipe(regexRename(/\.js$/, '.min.js').on('error', gutil.log))
    .pipe(debug())
    .pipe(uglify({
      'warnings': true,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));
});

/* Minify the CSS used for Open Sesame (same is used for stand alone and
 * chrome extension).
 */
gulp.task('minifycss', ['copyandminifyjs'], function() {
  gulp.src(['src/style.css'])
    .pipe(rename('opensesame.css'))
    .pipe(gulp.dest('./build/css/'))
    .pipe(rename('opensesame.min.css'))
    .pipe(nano()).on('error', gutil.log)
    .pipe(gulp.dest('./dist/css/'));
});

/* Copy the MDL files from source to build
 */
gulp.task('copymaterial', ['minifycss'], function() {
  gulp.src(['lib/material.min.css'])
    .pipe(gulp.dest('./build/lib/'))
    .pipe(gulp.dest('./dist/lib/'))
    .pipe(gulp.dest('./chrome-ext/build/lib/'))
    .pipe(gulp.dest('./chrome-ext/dist/lib/'));

  gulp.src(['lib/material.min.js'])
    .pipe(gulp.dest('./build/lib/'))
    .pipe(gulp.dest('./dist/lib/'))
    .pipe(gulp.dest('./chrome-ext/build/lib/'))
    .pipe(gulp.dest('./chrome-ext/dist/lib/'));
});

/* Copy polyfills to library directory */
gulp.task('copypollyfills', ['copymaterial'], function() {
  gulp.src(['lib/crypto.min.js', 'lib/Promise.min.js'])
    .pipe(gulp.dest('./build/lib/'))
    .pipe(gulp.dest('./dist/lib/'))
    .pipe(gulp.dest('./chrome-ext/build/lib/'))
    .pipe(gulp.dest('./chrome-ext/dist/lib/'));
});

/* Special task to build the three CyrptoJS files used into a single file */
gulp.task('buildcryptojs', ['copypollyfills'], function() {
  gulp.src(['lib/aes.js', 'lib/pbkdf2.js', 'lib/hmac-sha256.js'])
    .pipe(debug())
    .pipe(concat('crypto.min.js'))
    .pipe(gulp.dest('./lib/'));
});

/* Copy the favicon files
 */
gulp.task('copyfavicon', ['buildcryptojs'], function() {
  gulp.src(['src/*.png', 'src/*.ico'])
    .pipe(debug())
    .pipe(gulp.dest('./build/images/'))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(gulp.dest('./chrome-ext/build/images/'))
    .pipe(gulp.dest('./chrome-ext/dist/images/'));
});


/* Copy all the required files for stand alone operation to the dist directory.
 */
/* gulp.task('copytodist', ['copyfavicon'], function() {
  gulp.src(['./build/*.css', './build/*.html'])
    .pipe(debug())
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
}); */

/* Minify the test spec file.
 */
gulp.task('minifytestspec', ['copyfavicon'], function() {
  gulp.src(['test/opensesame-spec.js'])
    .pipe(rename('opensesame-spec.min.js'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(gulp.dest('./test/'));
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
        match: 'oscss',
        replacement: 'ext-opensesame.css',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'os-jsref',
        replacement: 'os.js',
      }],
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./chrome-ext/build/'));

  // Minifed versions
  gulp.src(['src/ext-container.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(replace({
      patterns: [{
        match: 'oscss',
        replacement: 'ext-opensesame.min.css',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'os-jsref',
        replacement: 'os.min.js',
      }],
    }))
    .pipe(rename('opensesame.html'))
    .pipe(gulp.dest('./chrome-ext/dist/'));
});

/* Concatenate the main css and specialised chrome extension css and minifies
 *  it.
 */
gulp.task('minifyextcss', ['buildexthtml'], function() {
  gulp.src(['src/style.css', 'src/ext-style.css'])
    .pipe(debug())
    .pipe(concat('ext-opensesame.css'))
    .pipe(gulp.dest('./chrome-ext/build/css/'))
    .pipe(rename('ext-opensesame.min.css'))
    .pipe(nano()).on('error', gutil.log)
    .pipe(gulp.dest('./chrome-ext/dist/css/'));
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
    .pipe(gulp.dest('./chrome-ext/build/'))
    .pipe(gulp.dest('./chrome-ext/dist/'));
});

/* Copy all the required files for chrome extension operation to the
 *  chrome-ext directory.
 */
gulp.task('copytochromeext', ['buildmanifestfiles'], function() {
  gulp.src(['src/ext-background.js', 'src/ext-content.js'])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/build/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/opensesame-38.png'])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/build/images/'))
    .pipe(gulp.dest('./chrome-ext/dist/images/'));

  gulp.src(['lib/material.min.js', 'src/cryptojs.js',
    'lib/material.min.css'])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/build/lib/'))
    .pipe(gulp.dest('./chrome-ext/dist/lib/'));

  gulp.src(['fonts/*.woff2'])
    .pipe(debug())
    .pipe(gulp.dest('./chrome-ext/build/fonts/'))
    .pipe(gulp.dest('./chrome-ext/dist/fonts/'));
});


gulp.task('watch', ['copytochromeext'], function() {
  gulp.watch('src/*.*', ['copytochromeext']);
});


/* Watch for changes to html and then reload when updated
 */
/*
gulp.task('html', ['copytodistchromeext'], function() {
  gulp.src('./build/*.html')
    .pipe(connect.reload());
});*/

/* Standard server task */

gulp.task('servebuild', function() {
  connect.server({
    root: 'build',
    livereload: true,
  });

// Execute the reload task anytime the source files change
// gulp.watch('src/*.*', ['servebuild']);
});


/* Task to deploy the built app to the github pages branch */
gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});
