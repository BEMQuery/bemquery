// Karma configuration
// Generated on Sun Mar 20 2016 23:19:01 GMT+0100 (CET)

const isTravis = require( 'is-travis' );

module.exports = function( config ) {
	config.set( {
		failOnEmptyTestSuite: false,

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../../',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'mocha',
			'sinon-chai',
			'fixture'
		],


		// list of files / patterns to load in the browser
		files: [
			'tests/**/*.js',
			'tests/support/fixtures/**/*'
		],


		// list of files to exclude
		exclude: [
			'tests/support/**/*.js'
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'tests/**/*.js': [ 'rollup', 'coverage' ],
			'tests/support/fixtures/**/*.html': [ 'html2js' ],
			'tests/support/fixtures/**/*.json': [ 'json_fixtures' ]
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: [
			'progress',
			'coverage'
		],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: isTravis ? [
			'Firefox'
		] : [
			'Chrome',
			'Firefox'
		],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: 1,

		rollupPreprocessor: {
			rollup: {
				plugins: [
					require( 'rollup-plugin-mockr' )( require( '../mockr/default' ) ),
					require( 'rollup-plugin-commonjs' )(),
					require( 'rollup-plugin-node-resolve' )( {
						jsnext: true,
						main: false
					} )
				]
			},
			bundle: {
				format: 'iife'
			}
		},

		jsonFixturesPreprocessor: {
			variableName: '__json__'
		},

		coverageReporter: {
			type: 'text-summary'
		}
	} );
};
