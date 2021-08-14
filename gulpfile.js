const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const pkg = require('./package.json');
const verionToken = '@version@';

const distJsPath = './dist/js/';
const bundledFile = 'dataBind.js';

// set release version to source
gulp.task('versioning', function(cb) {
    return gulp
        .src(`${distJsPath}${bundledFile}`)
        .pipe(replace(verionToken, `${pkg.version}`))
        .pipe(gulp.dest(distJsPath));
});

// uglify
gulp.task('compress', gulp.series('versioning'), function(cb) {
    return gulp
        .src(`${distJsPath}${bundledFile}`)
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(distJsPath));
});
