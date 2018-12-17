module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // create a static server for jasmine / PhantomJS
        connect: {
            test: {
                options: {
                    hostname: 'localhost',
                    port: 8887,
                },
            },
            debug: {
                options: {
                    hostname: 'localhost',
                    port: 8889,
                    keepalive: true,
                    open: 'http://localhost:8889/_SpecRunner.html',
                },
            },
        },

        // this is just config for jasmine - not a grunt module
        jasmineTestSettings: {
            src: ['./dist/js/dataBind.js'],
            host: 'http://localhost:8887',
            specs: './test/specs/*.spec.js',
            styles: './test/css/reporter.css',
            vendor: ['./vendors/lodash.custom.min.js', './vendors/jquery-3.2.1.min.js', './vendors/jasmine-jquery.js'],
            helpers: ['./test/helpers/testHelper.js'],
        },

        jasmine: {
            test: {
                src: '<%= jasmineTestSettings.src %>',
                options: {
                    'styles': '<%= jasmineTestSettings.styles %>',
                    'host': '<%= jasmineTestSettings.host %>',
                    'specs': '<%= jasmineTestSettings.specs %>',
                    'vendor': '<%= jasmineTestSettings.vendor %>',
                    'helpers': '<%= jasmineTestSettings.helpers %>',
                    'keepRunner': true,
                    '--web-security': 'no',
                    '--local-to-remote-url-access': true,
                    '--ignore-ssl-errors': true,
                },
            },
            // code test coverage
            coverage: {
                src: '<%= jasmineTestSettings.src %>',
                options: {
                    'host': '<%= jasmineTestSettings.host %>',
                    'specs': '<%= jasmineTestSettings.specs %>',
                    'vendor': '<%= jasmineTestSettings.vendor %>',
                    'helpers': '<%= jasmineTestSettings.helpers %>',
                    'keepRunner': true,
                    '--web-security': 'no',
                    '--local-to-remote-url-access': true,
                    '--ignore-ssl-errors': true,

                    'template': require('grunt-template-jasmine-istanbul'),
                    'templateOptions': {
                        coverage: './coverage/coverage.json',
                        report: [
                            {
                                type: 'text-summary',
                            },
                            {
                                type: 'lcov',
                                options: {
                                    dir: './coverage/lcov',
                                },
                            },
                        ],
                    },
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-open');

    // jasmine test via PhantomJS with 'connect' local server - for local dev and debug
    grunt.registerTask('test', ['connect:test', 'jasmine:test', 'connect:debug']);
    // jasmine test with coverage - this if for build server
    grunt.registerTask('test:coverage', ['connect:test', 'jasmine:coverage']);
};
