/*! bemquery v0.1.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.bemquery = factory());
}(this, (function () { 'use strict';

/*! bemquery-selector-converter v0.1.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
/** Simple class representing selector */
class Selector {
	/**
	 * Creates new Selector instance.
	 *
	 * @param {String} BEM BEM version of selector.
	 * @param {String} CSS CSS version of selector.
	 */
	constructor( BEM, CSS ) {
		/**
		 * BEM version of selector.
		 *
		 * @property {String}
		 */
		this.BEM = BEM;

		/**
		 * CSS version of selector.
		 *
		 * @property {String}
		 */
		this.CSS = CSS;

		Object.freeze( this );
	}
}

function endsWithModifier( selector, bemConfig ) {
	const regex = new RegExp( `[^${bemConfig.elemSeparator}${bemConfig.modifierSeparator}]+${bemConfig.modifierSeparator}[^${bemConfig.elemSeparator}${bemConfig.modifierSeparator}]+$`,
		'g' );

	return !!selector.match( regex );
}

function getSelectorWithoutModifier( selector, modifierSeparator ) {
	return ` ${selector.substring( selector.lastIndexOf( '.' ), selector.lastIndexOf( modifierSeparator ) )}`;
}

const defaultConfig = {
	bem: {
		elemSeparator: '__',
		modifierSeparator: '_'
	},
	rules: {
		default( token ) {
			return `.${token}`;
		},

		' > '( token, config ) {
			return ` ${config.rules.default( token )}`;
		},

		' '( token, config, selector ) {
			if ( endsWithModifier( selector, config.bem ) ) {
				return `${getSelectorWithoutModifier( selector, config.bem.modifierSeparator )}${config.bem.elemSeparator}${token}`;
			}

			return `${config.bem.elemSeparator}${token}`;
		},

		':'( token, config ) {
			return `${config.bem.modifierSeparator}${token}`;
		}
	}
};

function convertToken( tokens, config, selector = '' ) {
	const rules = config.rules;
	const delimeter = tokens.shift();
	let rule;
	let token;

	if ( !delimeter ) {
		return selector;
	} else if ( !selector ) {
		token = delimeter;
		rule = rules.default;
	} else {
		token = tokens.shift();
		rule = rules[ delimeter ];
	}

	if ( typeof rule !== 'function' ) {
		throw new SyntaxError( 'Malformed BEM rule' );
	}

	selector += rule( token, config, selector );

	return convertToken( tokens, config, selector );
}

function convert( selector, config ) {
	const rules = Object.keys( config.rules ).filter( ( rule ) => {
		return rule !== 'default';
	} );
	const splitRule = new RegExp( `(${rules.join( '|' )})`, 'g' );
	const splittedSelector = selector.split( splitRule );

	selector = convertToken( splittedSelector, config );

	return selector;
}

/** Converter's class*/
class Converter {
	/**
	 * Create converter's instance.
	 *
	 * @param {Object} [config=defaultConfig] converter's configuration options.
	 * @class
	 */
	constructor( config = defaultConfig ) {
		/**
		 * Converter's configuration
		 *
		 * @property {Object}
		 */
		this.config = config;
	}

	/**
	 * Converts given selector to CSS.
	 *
	 * @param {String} selector BEM selector to be converted.
	 * @return {Selector} Converted selector.
	 */
	convert( selector ) {
		const convertedSelector = convert( selector, this.config );

		return new Selector( selector, convertedSelector );
	}

	/**
	 * Get state from given `[class]` attribute contents.
	 *
	 * @param {String} className HTML `[class]` attribute.
	 * @return {String|null} Fetched state.
	 */
	getStateFromClass( className ) {
		if ( typeof className !== 'string' ) {
			throw new TypeError( 'Class must be a string.' );
		}

		const bemConfig = this.config.bem;
		const regex = new RegExp( `[^${bemConfig.elemSeparator}${bemConfig.modifierSeparator}]+${bemConfig.modifierSeparator}([^${bemConfig.elemSeparator}${bemConfig.modifierSeparator}]+)$` );
		const match = className.match( regex );

		return match ? match[ 1 ] : null;
	}
}

/**
 * BEM selector converter factory.
 *
 * @param {Object} [converterConfig=defaultConverterConfig] Configuration object that
 * should be passed to the Converter constructor.
 * @return {Converter} Converter's instance.
 */
function factory$2( converterConfig = defaultConfig ) {
	const converter = new Converter( converterConfig );

	return converter;
}

/*! bemquery-selector-engine v0.2.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
/** Simple selector engine. */
class SelectorEngine {
	/**
	 * Find elements using passed selector.
	 *
	 * @param {String} selector CSS selector.
	 * @param {HTMLElement|Document} context Context
	 * in which element should be found.
	 * @returns {HTMLElement[]} Found elements.
	 */
	find( selector, context = document ) {
		let tmpId = false;

		if ( context !== document ) {
			if ( !context.id ) {
				tmpId = true;
				context.id = `BEMQueryTMP_${Date.now()}`;
			}

			selector = `#${context.id} ${selector}`;
		}

		const elements = Array.from( context.querySelectorAll( selector ) );

		if ( tmpId ) {
			context.removeAttribute( 'id' );
		}

		return elements;
	}
}

/*! bemquery-core v0.1.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
function checkConverter( converter ) {
	return typeof converter === 'object' && typeof converter.convert === 'function';
}

function checkSelectorEngine( selectorEngine ) {
	return typeof selectorEngine === 'object' && typeof selectorEngine.find === 'function';
}

function determineContext( context ) {
	if ( context instanceof BEMQuery ) { // eslint-disable-line no-use-before-define
		context = context.elements[ 0 ];
	}

	if ( !( context instanceof HTMLElement ) && context !== document ) {
		context = document;
	}

	return context;
}

function fetchElements( query, context, converter, selectorEngine ) {
	if ( !query ) {
		throw new TypeError( 'Selector must be set.' );
	}

	if ( typeof query === 'string' ) {
		query = converter.convert( query ).CSS;
		return selectorEngine.find( query, context );
	} else if ( query instanceof HTMLElement ) {
		return [
			query
		];
	} else if ( query instanceof BEMQuery ) { // eslint-disable-line no-use-before-define
		return query.elements;
	} else if ( typeof query === 'object' ) {
		return Array.from( query );
	} else {
		throw new TypeError( 'Selector must be a string, object, array or DOM element.' );
	}
}

function defineProperties( obj, elements ) {
	Object.defineProperty( obj, 'elements', {
		value: elements
	} );

	obj.elements.forEach( ( element, index ) => {
		Object.defineProperty( obj, index, {
			enumerable: true,
			get() {
				return new BEMQuery( this.elements[ index ], document, this.converter, this.selectorEngine ); // eslint-disable-line no-use-before-define
			}
		} );
	}, obj );

	Object.defineProperty( obj, 'length', {
		enumerable: true,
		get() {
			return this.elements.length;
		}
	} );
}

/** Class representing elements collection. */
class BEMQuery {
	/**
	 * Creates elements collection.
	 *
	 * @param {String|Iterable|HTMLElement} query Selector or
	 * existing elements collection upon which the new elements collection
	 * should be created.
	 * @param {Document|HTMLElement|BEMQuery} context Context from which
	 * elements should be fetched.
	 * @param {Converter} converter BEM selector converter to be used.
	 * @param {SelectorEngine} selectorEngine CSS selector engine to be used
	 * by the current and descendant `BEMQuery` instances.
	 * @class
	 */
	constructor( query, context, converter, selectorEngine ) {
		if ( !checkConverter( converter ) ) {
			throw new TypeError( 'Converter must be an object with convert method defined.' );
		}

		if ( !checkSelectorEngine( selectorEngine ) ) {
			throw new TypeError( 'SelectorEngine must be an object with find method defined.' );
		}

		this.converter = converter;
		this.selectorEngine = selectorEngine;

		context = determineContext( context );

		defineProperties( this, fetchElements( query, context, converter, selectorEngine ) );
	}

	/**
	 * Gets element with given index.
	 *
	 * @param {Number} index Element's index.
	 * @return {BEMQuery} New BEMQuery instance with fetched element
	 * as an only element in the collection.
	 */
	get( index ) {
		index = Number( index );

		if ( Number.isNaN( index ) ) {
			throw new TypeError( 'Index must be a correct Number.' );
		} else if ( index < 0 ) {
			throw new RangeError( 'Index must be greater or equal to 0.' );
		} else if ( index > ( this.elements.length - 1 ) ) {
			throw new RangeError( 'Index cannot be greater than collection\'s length.' );
		}

		return new BEMQuery( this.elements[ index ], document, this.converter, this.selectorEngine );
	}

	/**
	 * Executes callback on every element in the collection.
	 *
	 * @param {Function} callback Callback to be executed.
	 * @return {BEMQuery} Current `BEMQuery` instance.
	 */
	each( callback ) {
		if ( typeof callback !== 'function' ) {
			throw new TypeError( 'Callback must be a function.' );
		}

		const converter = this.converter;
		const selectorEngine = this.selectorEngine;

		this.elements.forEach( ( element ) => {
			callback( new BEMQuery( element, document, converter, selectorEngine ) );
		} );

		return this;
	}

	/**
	 * Returns iterator for contained elements.
	 *
	 * @return {Iterator} Returned iterator.
	 */
	[ Symbol.iterator ]() {
		let i = 0;
		const elements = this.elements;
		const converter = this.converter;
		const selectorEngine = this.selectorEngine;

		return {
			next() {
				if ( i < elements.length ) {
					const element = elements[ i++ ];

					return {
						value: new BEMQuery( [ element ], document, converter, selectorEngine ),
						done: false
					};
				}

				return {
					done: true
				};
			}
		};
	}
}

/**
 * BEMQuery instance factory.
 *
 * @param {String|Iterable|HTMLElement} query Selector or
 * existing elements collection upon which the new elements collection
 * should be created.
 * @param {Document|HTMLElement|BEMQuery} context Context from which
 * elements should be fetched.
 * @return {BEMQuery} New BEMQuery instance.
 */
function factory( query, context = document ) {
	const converter = factory$2();
	const selectorEngine = new SelectorEngine();
	const bemQuery = new BEMQuery( query, context, converter, selectorEngine );

	return bemQuery;
}




var $$1 = Object.freeze({
	BEMQuery: BEMQuery,
	default: factory
});

/*! bemquery-async-dom v0.1.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
/** Class storing queue of DOM operations. */
class Batch {
	/**
	 * Constructing new batch.
	 *
	 * @class
	 */
	constructor() {
		this.read = [];
		this.write = [];
	}

	/**
	 * Add new operation to the batch.
	 *
	 * @param {String} type Type of operation. Must be either "read" or "write".
	 * @param {Function} fn Operation to be fired.
	 * @return {BEMQuery} Current BEMQuery instance.
	 */
	add( type, fn ) {

		if ( type !== 'read' && type !== 'write' ) {
			throw new TypeError( 'Type must be either \'read\' or \'write\'.' );
		}

		if ( typeof fn !== 'function' ) {
			throw new TypeError( 'Task must be a function.' );
		}

		this[ type ].push( fn );
	}

	/**
	 * Run operations of given type.
	 *
	 * @param {String} type Type of operations to run. Must be either "read" or "write".
	 * @return {Promise} Promise that will be fulfilled after running all tasks.
	 */
	run( type = 'read' ) {
		if ( type !== 'read' && type !== 'write' ) {
			throw new TypeError( 'Type must be either \'read\' or \'write\'.' );
		}

		return new Promise( ( resolve ) => {
			requestAnimationFrame( () => {
				const results = [];

				this[ type ].forEach( ( fn ) => {
					results.push( fn() );
				} );

				this[ type ] = [];

				return resolve( results );
			} );
		} );
	}
}

/**
 * Method that runs all read operations stored in batch
 *
 * @return {Promise} Promise returned by batch.
 * @memberof BEMQuery
 */
BEMQuery.prototype.read = function() {
	if ( !this.batch ) {
		this.batch = new Batch();
	}

	return this.batch.run( 'read' );
};

/**
 * Method that runs all write operations stored in batch
 *
 * @return {Promise} Promise returned by batch.
 * @memberof BEMQuery
 */
BEMQuery.prototype.write = function() {
	if ( !this.batch ) {
		this.batch = new Batch();
	}

	return this.batch.run( 'write' );
};

/**
 * Method for getting/setting inner HTML of all elements in collection
 *
 * @param {String} [newHTML] The new inner HTML value. If not specified,
 * the method will work as getter.
 * @return {BEMQuery} Current BEMQuery instance.
 * @memberof BEMQuery
 */
BEMQuery.prototype.html = function( newHTML ) {
	if ( !this.batch ) {
		this.batch = new Batch();
	}

	if ( typeof newHTML !== 'undefined' ) {
		newHTML = String( newHTML );

		this.batch.add( 'write', () => {
			const elements = this.elements;

			elements.forEach( ( element ) => {
				element.innerHTML = newHTML;
			} );
		} );
	} else {
		this.batch.add( 'read', () => {
			const elements = this.elements;
			const htmls = [];

			elements.forEach( ( element ) => {
				htmls.push( element.innerHTML );
			} );

			return htmls;
		} );
	}

	return this;
};

function processClasses( converter, element ) {
	const states = [];

	[].forEach.call( element.classList, ( className ) => {
		const state = converter.getStateFromClass( String( className ) );

		if ( state ) {
			states.push( state );
		}
	} );

	return states;
}

/**
 * Method for getting states from all elements in collection.
 *
 * @return {BEMQuery} Current BEMQuery instance.
 * @memberof BEMQuery
 */
BEMQuery.prototype.getStates = function() {
	if ( !this.batch ) {
		this.batch = new Batch();
	}

	const elements = this.elements;

	this.batch.add( 'read', () => {
		const result = [];

		elements.forEach( ( element ) => {
			result.push( processClasses( this.converter, element ) );
		} );

		return result;
	} );

	return this;
};

/*! bemquery-dom-events v0.1.4 | (c) 2016 BEMQuery team | MIT license (see LICENSE) */
/** Storage for events listeners */
class ListenersStorage {
	/**
	 * Creates new storage for event lsiteners
	 *
	 * @class
	 */
	constructor() {
		this.storage = new WeakMap();
	}

	/**
	 * Adds event listener to the storage.
	 *
	 * @param {Object} element Element to which listener is binded.
	 * @param {String} type Type of event.
	 * @param {String} selector Selector for event delegation.
	 * @param {Function} fn Original callback.
	 * @param {Function} listener Created listener.
	 * @return {void}
	 */
	add( element, type, selector, fn, listener ) {
		let listeners = {};

		if ( this.storage.has( element ) ) {
			listeners = this.storage.get( element );
		}

		if ( typeof listeners[ type ] === 'undefined' ) {
			listeners[ type ] = {};
		}

		if ( typeof listeners[ type ][ selector ] === 'undefined' ) {
			listeners[ type ][ selector ] = [];
		}

		listeners[ type ][ selector ].push( [ fn, listener ] );

		this.storage.set( element, listeners );
	}

	/**
	 * Gets event listener that matches the given criteria.
	 *
	 * @param {Object} element Element to which listener is binded.
	 * @param {String} type Type of event.
	 * @param {String} selector Selector for event delegation.
	 * @param {Function} fn Original callback.
	 * @return {Function} Event listener.
	 */
	get( element, type, selector, fn ) {
		if ( !this.storage.has( element ) ) {
			return null;
		}

		const listeners = this.storage.get( element );

		if ( typeof listeners[ type ] === 'undefined' || typeof listeners[ type ][ selector ] === 'undefined' ) {
			return null;
		}

		for ( let pair of listeners[ type ][ selector ] ) { // eslint-disable-line prefer-const
			if ( pair[ 0 ] === fn ) {
				return pair[ 1 ];
			}
		}

		return null;
	}

	/**
	 * Removes event listener that matches the given criteria.
	 *
	 * @param {Object} element Element to which listener is binded.
	 * @param {String} type Type of event.
	 * @param {String} selector Selector for event delegation.
	 * @param {Function} fn Original callback.
	 * @return {Function} Event listener.
	 */
	remove( element, type, selector, fn ) {
		if ( !this.storage.has( element ) ) {
			return null;
		}

		const listeners = this.storage.get( element );

		if ( typeof listeners[ type ] === 'undefined' || typeof listeners[ type ][ selector ] === 'undefined' ) {
			return null;
		}

		listeners[ type ][ selector ].forEach( ( pair, i ) => {
			if ( pair[ 0 ] === fn ) {
				listeners[ type ][ selector ].splice( i, 1 );
			}
		} );

		return null;
	}
}

const storage = new ListenersStorage();

/**
 * Method for adding event listener to the element.
 *
 * @param {String} type Type of the event.
 * @param {String|Function} selector If that parameter is a string,
 * then it's used to construct checking for the event delegation.
 * However if function is passed, then it becomes the event's listener.
 * @param {Function} callback If the second parameter is a string, this
 * function will be used as an event's listener.
 * @return {BEMQuery} Current BEMQuery instance.
 * @memberof BEMQuery
 */
BEMQuery.prototype.on = function( type, selector, callback ) {
	let listener;

	if ( typeof type !== 'string' || !type ) {
		throw new TypeError( 'Type of event must be a non-empty string.' );
	}

	if ( ( typeof selector !== 'string' && typeof selector !== 'function' ) || !selector ) {
		throw new TypeError( 'Selector must be a non-empty string or function.' );
	}

	if ( typeof selector === 'string' ) {
		if ( typeof callback !== 'function' ) {
			throw new TypeError( 'Callback must be a function.' );
		}

		selector = this.converter.convert( selector ).CSS;
		selector = `${selector}, ${selector} *`;

		listener = ( evt ) => {
			if ( evt.target.matches( selector ) ) {
				callback( evt );
			}
		};
	} else {
		listener = selector;
	}

	this.elements.forEach( ( element ) => {
		element.addEventListener( type, listener, false );

		if ( typeof selector === 'string' ) {
			storage.add( element, type, selector, callback, listener );
		}
	} );

	return this;
};

/**
 * Method for removing event listener from the element.
 *
 * @param {String} type Type of the event.
 * @param {String|Function} selector If that parameter is a string,
 * then it's used to construct checking for the event delegation.
 * However if function is passed, then it becomes the event's listener.
 * @param {Function} callback If the second parameter is a string, this
 * function will be used as an event's listener.
 * @return {BEMQuery} Current BEMQuery instance.
 * @memberof BEMQuery
 */
BEMQuery.prototype.off = function( type, selector, callback ) {
	let listener;

	if ( typeof type !== 'string' || !type ) {
		throw new TypeError( 'Type of event must be a non-empty string.' );
	}

	if ( ( typeof selector !== 'string' && typeof selector !== 'function' ) || !selector ) {
		throw new TypeError( 'Selector must be a non-empty string or function.' );
	}

	if ( typeof selector === 'string' ) {
		if ( typeof callback !== 'function' ) {
			throw new TypeError( 'Callback must be a function.' );
		}

		selector = this.converter.convert( selector ).CSS;
		selector = `${selector}, ${selector} *`;
	} else {
		listener = selector;
	}

	this.elements.forEach( ( element ) => {
		if ( typeof selector === 'string' ) {
			listener = storage.get( element, type, selector, callback );

			storage.remove( element, type, selector, callback );
		}
		element.removeEventListener( type, listener, false );
	} );

	return this;
};

return $$1;

})));
//# sourceMappingURL=bemquery.umd.js.map
