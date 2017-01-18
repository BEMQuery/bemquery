import nodeResolve from 'rollup-plugin-node-resolve';
import convertCJS from 'rollup-plugin-commonjs';
import babili from 'rollup-plugin-real-babili';

const packageInfo = require( '../../package.json' );
const banner = `/*! ${packageInfo.name} v${packageInfo.version} | (c) ${new Date().getFullYear()} ${packageInfo.author.name} | ${packageInfo.license} license (see LICENSE) */`;

export default {
	entry: 'src/index.js',
	format: 'es',
	sourceMap: true,
	plugins: [
		nodeResolve( {
			jsnext: true,
			main: false
		} ),
		convertCJS(),
		babili( {
			comments: false,
			banner
		} )
	],
	banner,
	dest: `dist/${packageInfo.name}.js`
};
