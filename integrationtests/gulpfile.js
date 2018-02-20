const gulp = require('gulp');
const connect = require('gulp-connect');
const istanbul = require('gulp-istanbul');
const webdriver = require('gulp-webdriver');

/**
 * 'connect' task
 * @description start a static server for webdriver to run on.
 * Note the port number must match on in 'wdio.conf.js'
 */
gulp.task('connect', function() {
    connect.server({
        root: '../',
        port: 8085,
    });
});

/**
 * 'pre-test' task
 * @description setup instanbul to instrutment test file (../dist/js/dataBind.js)
 */
gulp.task('pre-test', function() {
    return (gulp
        .src(['../dist/**/*.js'])
    // Covering files
        .pipe(istanbul())
    // Write the covered files to a temporary directory
        .pipe(gulp.dest('test-tmp/')) );
});

/**
 * 'test:e2e'
 * @description run end-to-end test using wdio with instanbul coverage
 */
gulp.task('test:e2e', ['connect', 'pre-test'], function() {
    return (gulp
        .src(['wdio.conf.js'])
        .pipe(webdriver())
    // Creating the reports after tests ran
        .pipe(
            istanbul.writeReports({
                reporters: ['lcov', 'json', 'text', 'text-summary'],
            })
        )
        .on('end', function() {
            // stop the connect server after 'writeReports'
            console.log('stopping connect server...');
            connect.serverClose();
        })
    // Enforce a coverage of at least 90%
        .pipe(
            istanbul.enforceThresholds({
                thresholds: {
                    global: 90,
                },
            })
        ) );
});
