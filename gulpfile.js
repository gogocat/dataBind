const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');

const distJsPath = './dist/js/';
const bundledFile = 'dataBind.js';

// uglify
gulp.task('compress', function(cb) {
    return gulp
        .src(distJsPath + bundledFile)
        .pipe(rename({extname: '.min.js'}))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest(distJsPath));
});
