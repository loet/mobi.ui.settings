module.exports = function (grunt) {

    var options, pkg, destinationFile;

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma');

    // load build config
    options = require('./build.config');
    // initialize loaded configs
    grunt.initConfig(options);

    pkg = grunt.file.readJSON('package.json');
    destinationFile = 'dist/' + pkg.name + '.js';

    grunt.config.merge({
        pkg: pkg,
        concat: {
            options: {
                stripBanners: true,
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n'
            },
            dist: {
                src: '<%= config.src %>',
                dest: destinationFile
            }
        },

        karma: {
            test: {
                options: {
                    files: [
                        '<%= config.bower_components %>',
                        destinationFile,
                        'src/**/*.spec.js'
                    ]
                },
                runnerPort: 9999,
                singleRun: true,
                background: false,
                browsers: ['PhantomJS'],
                frameworks: ['jasmine'],
                reporters: ['progress'],
                plugins: [
                    'karma-jasmine',
                    'karma-phantomjs-launcher'
                ],
                logLevel: 'ERROR'
            },
            watch: {
                options: {
                    files: [
                        '<%= config.bower_components %>',
                        'src/**/*.js'
                    ]
                },
                runnerPort: 8001,
                singleRun: false,
                background: false,
                autoWatch: true,
                browsers: ['Chrome'],
                frameworks: ['jasmine'],
                reporters: ['progress'],
                plugins: [
                    'karma-jasmine',
                    'karma-chrome-launcher'
                ],
                logLevel: 'ERROR'
            }
        }
    });

    grunt.registerTask('default', ['test']);

    grunt.registerTask('test', 'Run karma unit tests', [
        'concat:dist', 'karma:test'
    ]);

    grunt.registerTask('run', 'Run service', [
        'karma:watch'
    ]);

};