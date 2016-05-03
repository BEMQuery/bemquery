import config from './es6.js';

const packageInfo = require( '../../package.json' );

config.format = 'umd',
config.moduleName = 'bemquerySelectorEngine';
config.dest = `dist/${packageInfo.name}.umd.js`;

export default config;
