import config from './umd.js';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const packageInfo = require( '../../package.json' );

config.plugins.push( babel( {
	presets: [
		[ 'es2015', { modules: false } ]
	],
	plugins: [ 'external-helpers' ]
} ) );
config.plugins.push( uglify( {
	comments: '/^/*!/',
	'source-map': './dist/${packageInfo.name}.es5.js.map'
} ) );

config.dest = `dist/${packageInfo.name}.es5.js`;

export default config;
