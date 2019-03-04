const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const vinylSourceStream = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const util = require('gulp-util');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const pump = require('pump');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

// shorthands
const entryFilePath = './src/index.js';
const distJsPath = './dist/js/';
const bundledFile = 'dataBind.js';

// load package json data
const pkg = require('./package.json');

// release banner comment
const banner = [
    '/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    '',
].join('\n');

// bundle - using browserify -
gulp.task('bundle', () => {
    const sources = browserify({
        entries: entryFilePath,
        debug: true, // Build source maps
    }).transform(
        babelify.configure({
            // configure babel: https://babeljs.io/docs/usage/options/
            presets: ['@babel/preset-env'],
            plugins: ['transform-es3-member-expression-literals', 'transform-es3-property-literals'],
        })
    );

    return sources
        .bundle()
        .pipe(vinylSourceStream(bundledFile))
        .pipe(vinylBuffer())
        .pipe(
            sourcemaps.init({
                loadMaps: true, // Load the sourcemaps browserify already generated
            })
        )
        .pipe(
            header(banner, {
                pkg: pkg,
            })
        )
        .on('error', util.log)
        .pipe(sourcemaps.write('.'))
        .pipe(replace('@version@', pkg.version))
        .pipe(gulp.dest(distJsPath));
});

// uglify
gulp.task('compress', function(cb) {
    pump([gulp.src(distJsPath + bundledFile), uglify(), rename({extname: '.min.js'}), gulp.dest(distJsPath)], cb);
});

// eslint
gulp.task('eslint', () => {
    return (
        gulp
            .src('./src/*.js')
            .pipe(
                eslint({
                    parser: 'babel-eslint',
                    parserOptions: {
                        ecmaVersion: 6,
                        ecmaFeatures: {
                            modules: true,
                        },
                    },
                    rules: {
                        quotes: [1, 'single'],
                        semi: [1],
                    },
                })
            )
            .pipe(eslint.format())
            // Brick on failure to be super strict
            .pipe(eslint.failOnError())
    );
});

// watch > eslint + bundle
gulp.task('watch', () => {
    gulp.watch('./src/**/*.js', gulp.parallel('eslint', 'bundle'));
});

gulp.task('default', gulp.series(gulp.parallel('eslint', 'bundle')), () => {
    gulp.start('compress');
});
