/* global require */

const gulp = require('gulp');
const del = require('del');
const replace = require('gulp-replace-task');
const fileinclude = require('gulp-file-include');
const rename = require('gulp-rename');
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
        match: 'crypto-jsref',
        replacement: 'cryptofunctions.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'firebase-jsref',
        replacement: 'fb-auth.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.js',
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
        match: 'firebase-jsref',
        replacement: 'fb-auth.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'crypto-jsref',
        replacement: 'cryptofunctions.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'manager-jsref',
        replacement: 'manager.min.js',
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
        match: 'crypto-jsref',
        replacement: 'cryptofunctions.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'firebase-jsref',
        replacement: 'fb-auth.js',
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
        match: 'crypto-jsref',
        replacement: 'cryptofunctions.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'firebase-jsref',
        replacement: 'fb-auth.min.js',
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

/* Copy the unminifed javascript for the stand alone website and extension
* versions of Open Sesame for the build directory.
*/
gulp.task('copybuildjs', ['buildstandalonehtml'], function() {
  gulp.src(['src/simple_assert.js', 'src/passoff.js', 'src/manager.js',
    'src/cryptofunctions.js', 'src/temporaryphrasestore.js',
    'src/opensesame.js', 'src/fb-auth.js',
  ])
    .pipe(gulp.dest('./build/scripts/'))
    .pipe(gulp.dest('./chrome-ext/build/scripts/'));

  // The extension requires one extra js file
  gulp.src(['ext-popup.js'])
    .pipe(gulp.dest('./chrome-ext/build/scripts/'));
});


/* Minify the javascript for the stand alone website and extension versions
* version of Open Sesame for the dist directory.
*/
gulp.task('minifyjs', ['copybuildjs'], function() {
  gulp.src(['src/simple_assert.js'])
    .pipe(rename('simple_assert.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/opensesame.js'])
    .pipe(rename('opensesame.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/manager.js'])
    .pipe(rename('manager.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/cryptofunctions.js'])
    .pipe(rename('cryptofunctions.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/temporaryphrasestore.js'])
    .pipe(rename('temporaryphrasestore.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/cryptofunctions.js'])
    .pipe(rename('cryptofunctions.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  gulp.src(['src/fb-auth.js'])
    .pipe(rename('fb-auth.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./dist/scripts/'))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));

  // Extra js file used in the chrome extension only
  gulp.src(['ext-popup.js'])
    .pipe(rename('ext-popup.min.js'))
    .pipe(uglify({
      mangle: false,
    }).on('error', gutil.log))
    .pipe(gulp.dest('./chrome-ext/dist/scripts/'));
});

/* Minify the CSS used for Open Sesame (same is used for stand alone and
 * chrome extension).
 */
gulp.task('minifycss', ['minifyjs'], function() {
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

/* Copy the favicon files
 */
gulp.task('copyfavicon', ['copymaterial'], function() {
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
        replacement: 'cryptofunctions.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'firebase-jsref',
        replacement: 'fb-auth.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'ext-popup-jsref-jsref',
        replacement: 'ext-popup.js',
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
        replacement: 'cryptofunctions.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'phrasestore-jsref',
        replacement: 'temporaryphrasestore.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'firebase-jsref',
        replacement: 'fb-auth.min.js',
      }],
    }))
    .pipe(replace({
      patterns: [{
        match: 'ext-popup-jsref-jsref',
        replacement: 'ext-popup.min.js',
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
    .pipe(gulp.dest('./chrome-ext/build/'))
    .pipe(rename('ext-opensesame.min.css'))
    .pipe(nano()).on('error', gutil.log)
    .pipe(gulp.dest('./chrome-ext/dist/'));
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
    .pipe(gulp.dest('./chrome-ext/dist/script/'));

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

/* Special task to build the three CyrptoJS files used into a single file */
gulp.task('buildcryptojs', function() {
  gulp.src(['lib/aes.js', 'lib/pbkdf2.js', 'lib/hmac-sha256.js'])
    .pipe(debug())
    .pipe(concat('cryptojs.js'))
    .pipe(gulp.dest('./build/'));
});
