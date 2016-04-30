/* global chai */

'use strict';

import { default as lib } from '../src/index';

const expect = chai.expect;

const $ = lib.default;
const BEMQuery = lib.BEMQuery;

describe( '$', () => {
	it( 'is a function', () => {
		expect( $ ).to.be.a( 'function' );
	} );
} );

describe( 'BEMQuery', () => {
	it( 'is a class', () => {
		expect( BEMQuery ).to.be.a( 'function' );
	} );

	it( 'has get method', () => {
		expect( BEMQuery.prototype.get ).to.be.a( 'function' );
	} );

	it( 'has each method', () => {
		expect( BEMQuery.prototype.each ).to.be.a( 'function' );
	} );

	it( 'has on method', () => {
		expect( BEMQuery.prototype.on ).to.be.a( 'function' );
	} );

	it( 'has off method', () => {
		expect( BEMQuery.prototype.off ).to.be.a( 'function' );
	} );

	it( 'has read method', () => {
		expect( BEMQuery.prototype.read ).to.be.a( 'function' );
	} );

	it( 'has write method', () => {
		expect( BEMQuery.prototype.write ).to.be.a( 'function' );
	} );

	it( 'has getStates method', () => {
		expect( BEMQuery.prototype.getStates ).to.be.a( 'function' );
	} );

	it( 'has html method', () => {
		expect( BEMQuery.prototype.get ).to.be.a( 'function' );
	} );
} );
