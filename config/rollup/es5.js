import config from './umd.js';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const packageInfo = require( '../../package.json' );

// Ovewrite original Babel plugin.
config.plugins[ 2 ] = babel( {
	presets: [
		[ 'es2015', { modules: false } ]
	],
	plugins: [ 'external-helpers' ]
} );

config.plugins.push( uglify( {
	output: {
		preamble: config.banner
	}
} ) );

config.dest = `dist/${packageInfo.name}.es5.js`;

export default config;
