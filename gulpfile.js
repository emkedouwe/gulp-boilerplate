const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const notify = require('gulp-notify');
const browser = require('browser-sync');
const imagemin = require('gulp-imagemin');
const extReplace = require("gulp-ext-replace");
const webp = require("imagemin-webp");
const psi = require("psi");


// Check for --production flag
//const PRODUCTION = !!(yargs.argv.production);

gulp.task('clean', () => {
  return del([
    'assets/styles/*.css',
  ]);
});

gulp.task('copy', () => {
  return gulp.src('dev/index.html')
    .pipe(gulp.dest('assets/'));
});

gulp.task('styles', () => {
  return gulp.src('dev/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('assets/styles/'))
    .pipe(notify("SASS compiled succesfully!"));
});

gulp.task('images', () => {
  return gulp.src('dev/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]))
    .pipe(gulp.dest('assets/images'));
});

gulp.task('images:webp', () => {
  return gulp.src('dev/images/**/*.*')
    .pipe(imagemin({
      verbose: true,
      plugins: webp({ quality: 70 })
    }))
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest('assets/images'));
});

// Run PageSpeed Insights
gulp.task('pagespeed', cb => {

  // Update the below URL to the public URL of your site
  return psi.output('sprintprint.netlify.com', {
    strategy: 'mobile',
    nokey: 'true',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb)

});

gulp.task('server', function(done) {
  browser.init({
    server: {
      baseDir: "./assets"
    },
    port: 8080,
    // open: false
  }, done);
  notify("Server started")
});

gulp.task('reload', (done) => {
  browser.reload();
  done();
});

gulp.task('watch', () => {
  gulp.watch('dev/styles/**/*.scss', (done) => {
      gulp.series(['clean', 'styles', 'reload'])(done);
  });
});

gulp.task('build', gulp.series(['clean', 'styles']));

gulp.task('default', gulp.series(['clean', 'copy', 'styles', 'server', 'watch']));