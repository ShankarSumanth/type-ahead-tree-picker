// Avoid `console` errors in browsers that lack a console.
( function () {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = ( window.console = window.console || {} );

	while ( length-- ) {
		method = methods[ length ];

		// Only stub undefined methods.
		if ( !console[ method ] ) {
			console[ method ] = noop;
		}
	}
}() );

// Place any jQuery/helper plugins in here.
( function ( $, window, document, Handlebars, undefined ) {
	"use strict";
	var TypeAheadTreePicker = {
		init: function ( $inputElement, options ) {
			var self = this;
			self.$inputElement = $inputElement;

			if ( typeof options == 'object' ) {
				self.options = $.extend( {}, $.fn.TypeAheadTreePicker.options, options );
			}

			self.registerHelper();
			self.registerTemplates();
			self.createDom();
			self.addEvents();
			self.renderDom();
			self.debounce();
		},
		/**
		 * Register Helper functions with Handlebars
		 */
		registerHelper: function () {
			Handlebars.registerHelper( 'nodeStatus', function ( node ) {
				return node ? "hide" : "show";
			} );
		},
		/**
		 * Register tempates with handlebars
		 */
		registerTemplates: function () {

			Handlebars.registerPartial( 'tree', Handlebars.templates.Tree );
		},
		/**
		 * create the necessary dom elements.
		 */
		createDom: function () {
			var self = this;

			// create a wrapper for the input field
			self.$treePickerContainer = $( "<div></div>", {
				class: "treePicker-container",
				tabIndex: 0
			} );

			// create a hidden input field which stores the id of the selected tree.
			self.$hiddenInputValue = $( '<input />', {
				type: 'text',
				id: 'value',
				required: 'required',
				css: {
					display: 'none'
				}
			} );

			// create the dropdown element
			self.$dropDown = $( Handlebars.templates.TypeAheadTreePicker( {
				data: self.options.data
			} ) );

		},
		/**
		 * add the event handlers for the TypeAheadTreePicker
		 */
		addEvents: function () {
			var self = this;

			self.$inputElement.on( 'focus', function () {
				self.showDropDown();
			} );

			var keyUp = function () {
				if ( self.$inputElement.val()
					.trim()
					.length > 0 )
					self.searchDropDown();
				else {
					var $tree = self.createTreeStructure( self.options.data );
					self.$dropDown.empty()
						.append( $tree );
				}

			};
			self.$inputElement.on( 'keyup', self.debounce( keyUp, self.options.delay ) );

			self.$dropDown.on( 'click', '.node-head', function ( e ) {
				e.stopPropagation();

				var $target = $( e.target );
				if ( $target.parent()
					.hasClass( 'node-img' ) ) {
					self.nodeHandler( $target );
				} else {
					self.selectedValueHandler( $target );
				}
			} );
		},
		/**
		 * show the dropdown.
		 */
		showDropDown: function () {
			var self = this;

			var position = self.getPosition();
			self.$dropDown.css( position )
				.show();
		},
		/**
		 * Search the dropdown tree to find the input characters and display the expanded tree
		 */
		searchDropDown: function () {
			var self = this;

			var newTreeModel = self.filterData();

			var $tree = self.createTreeStructure( newTreeModel );

			self.postProcessSearch( self.$inputElement.val()
				.toLowerCase(), $tree );

			self.$dropDown.empty()
				.append( $tree );
		},
		/**
		 * process the tree after the search has been done. It will expand the tree to the found text and change the node image
		 * recursively if necessary.
		 * @param  {String} text  the text to process
		 * @param  {jquery Object} $tree the jquery representation of the tree
		 */
		postProcessSearch: function ( text, $tree ) {
			var self = this;

			var $labels = $tree.find( '.node-head-content' );

			$labels.each( function ( i, label ) {

				var $label = $( label );

				var html = $label.html()
					.trim()
					.toLowerCase();

				if ( html.indexOf( text ) > -1 ) {
					var $containers = $label.parents( '.node-children' )
						.show();
					$containers.each( function ( i, container ) {
						var $container = $( container );

						$container.prev()
							.find( 'img' )
							.attr( 'src', 'img/minus.png' )
							.removeClass( 'node' )
							.addClass( 'leaf' );
					} );
				}
			} );

		},
		/**
		 * Render a html tree structure from the given tree model
		 * @param  {Array} treeModel the model representing the tree structure
		 * @return {jquery Object} tree  the jquery object containing the tree structure
		 */
		createTreeStructure: function ( treeModel ) {
			return $( Handlebars.templates.Tree( {
				data: treeModel
			} ) );
		},
		/**
		 * hide the dropDown
		 */
		hideDropDown: function () {
			var self = this;
			self.$dropDown.hide();
		},
		/**
		 * get positions to place the dropDown
		 */
		getPosition: function () {
			var self = this;

			var inputFieldOffset = self.$inputElement.offset();
			var inputFieldHeight = self.$inputElement.height();

			return {
				top: inputFieldOffset.top + inputFieldHeight + 10,
				left: inputFieldOffset.left
			};
		},
		/**
		 * handler for the selected value.
		 * @param  {jQuery Object} $target the clicked value.
		 */
		selectedValueHandler: function ( $target ) {
			var self = this;

			self.updateInputValue( $target );
			self.setHiddenInputValue( $target );
			self.hideDropDown();

		},
		/**
		 * set the value of the hidden input to the id of the node selected.
		 * @param {[jQuery Object]} $target the clicked value.
		 */
		setHiddenInputValue: function ( $target ) {
			var self = this;

			self.$hiddenInputValue.val( $target.closest( '.node-container' )
				.data( 'id' ) );
		},
		/**
		 * filter the dropdown tree's data to create new data model containing the input text.
		 * @return {Array} data filtered data.
		 */
		filterData: function () {
			var self = this;

			var text = self.$inputElement.val();
			var data = $.extend( true, [], self.options.data );
			// regex to find the value at the start of the text
			var pattern = new RegExp( '^(' + text + ')', 'i' );

			return self.find( pattern, data );

		},
		/**
		 * recursively find the text in the tree data
		 * @param  {RegExp} pattern the pattern to find
		 * @param  {Array} data    the data to find in
		 * @return {Array} data    filtered data by the patter.
		 */
		find: function ( pattern, data, parentNode ) {
			var self = this;
			if ( self.options.serverSide && typeof self.options.serverSearch === 'function' ) {
				return self.options.serverSearch( pattern );
			} else {
				for ( var i = data.length - 1; i >= 0; i-- ) {
					var node = data[ i ];
					if ( node.data ) {
						self.find( pattern, node.data, node );
					}
					if ( self.options.keepChildren ) {
						if ( ( node.data && node.data.length > 0 ) || pattern.test( node.label.toLowerCase() ) || ( parentNode !== undefined && pattern.test( parentNode.label.toLowerCase() ) ) )
							continue;
						else {
							data.splice( i, 1 );
						}
					} else {
						if ( node.data && node.data.length === 0 ) {
							delete node.data;
						}
						if ( node.data || pattern.test( node.label.toLowerCase() ) )
							continue;
						else {
							data.splice( i, 1 );
						}

					}
				}
				return data;
			}
		},
		/**
		 * handler for the node image clicks
		 * @param  {jquery Object} $image the node image.
		 */
		nodeHandler: function ( $image ) {
			var self = this;
			var $nodeContainer = $image.closest( '.node-container' );
			var $nodeChildren = $nodeContainer.children( '.node-children' );

			if ( $image.hasClass( 'node' ) ) {
				self.openNode( $nodeContainer, $nodeChildren, $image );
			} else {
				self.closeNode( $nodeContainer, $nodeChildren, $image );
			}
		},
		/**
		 * Open a node in the dropdown tree picker. If the node does not exist create the node children and then expand it.
		 * @param  {jQuery Object} $nodeContainer the parent container for the node
		 * @param  {jQuery Object} $nodeChildren  the child node which can be opened.
		 * @param  {jQuery Object} $image         the image that was clicked on.
		 */
		openNode: function ( $nodeContainer, $nodeChildren, $image ) {
			var self = this;
			var nodeContainer = $nodeContainer[ 0 ];
			var nodeChildren = $nodeChildren[ 0 ];
			if ( !$.contains( nodeContainer, nodeChildren ) ) {
				// implementaiton left for later lazy loading handling.
				if ( self.options.serverSide && typeof self.options.loadChildNodes === 'function' ) {
					var data = self.options.loadChildNodes( $nodeContainer.data( 'id' ) );
					var $tree = self.createTreeStructure( data )
						.show();
					$nodeContainer.append( $tree );
				}
			} else {
				$nodeChildren.slideDown( function () {
					$image.attr( 'src', 'img/minus.png' )
						.removeClass( 'node' )
						.addClass( 'leaf' );
				} );
			}
		},
		/**
		 * close the node if it has children else ignore.
		 * @param  {{jquery Object}}  $nodeContainer the parent container for the node
		 * @param  {jquery Object}    $nodeChildren the child elements container.
		 * @param  {jquery Object}    $image        the node image.
		 */
		closeNode: function ( $nodeContainer, $nodeChildren, $image ) {
			var self = this;
			var nodeContainer = $nodeContainer[ 0 ];
			var nodeChildren = $nodeChildren[ 0 ];

			if ( $.contains( nodeContainer, nodeChildren ) ) {
				$nodeChildren.slideUp( function () {
					$image.attr( 'src', 'img/plus.png' )
						.removeClass( 'leaf' )
						.addClass( 'node' );
				} );
			}

		},
		/**
		 * populate the child nodes/leafs.
		 */
		getChildren: function ( node ) {
			//simulate ajax call later, for now load from this method
			var self = this;

			if ( self.options.serverSide && typeof self.options.nodeCallback == 'function' ) {
				return self.options.nodeCallback( node );
			} else {
				console.log( 'server side is not enabled. Hence lazyloading of node children is not possible' );
			}
		},
		/**
		 * update the input field with the selected node value.
		 * @param  {jquery Object} $target the node element that was clicked
		 */
		updateInputValue: function ( $target ) {
			var self = this;
			var value;

			if ( $target.hasClass( 'node-head-content' ) ) {
				value = $target.html()
					.trim();
			} else {
				value = $target.children( '.node-head-content' )
					.html()
					.trim();
			}

			self.$inputElement.val( value );
		},
		/**
		 * render the dropdown tree picker.
		 */
		renderDom: function () {
			var self = this;

			self.$inputElement.wrap( self.$treePickerContainer );
			self.$inputElement.after( self.$hiddenInputValue );
			var position = self.getPosition();

			self.$dropDown.css( position );
			$( document.body )
				.append( self.$dropDown );
		},
		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds. If `immediate` is passed, trigger the function on the
		// leading edge, instead of the trailing.
		debounce: function ( func, wait, immediate ) {
			var self = this;
			var timeout, args, context, timestamp, result;

			var later = function () {
				var last = self.now() - timestamp;

				if ( last < wait && last >= 0 ) {
					timeout = setTimeout( later, wait - last );
				} else {
					timeout = null;
					if ( !immediate ) {
						result = func.apply( context, args );
						if ( !timeout ) context = args = null;
					}
				}
			};

			return function () {
				context = this;
				args = arguments;
				timestamp = self.now();
				var callNow = immediate && !timeout;
				if ( !timeout ) timeout = setTimeout( later, wait );
				if ( callNow ) {
					result = func.apply( context, args );
					context = args = null;
				}

				return result;
			};
		},
		now: function () {
			// A (possibly faster) way to get the current timestamp as an integer.
			return Date.now || function () {
				return new Date()
					.getTime();
			};
		}

	};

	/**
	 * Create a TypeAheadTreePicker as a jQuery plugin.
	 */
	$.fn.TypeAheadTreePicker = function ( options ) {
		var typeAheadTreePicker = Object.create( TypeAheadTreePicker );
		return typeAheadTreePicker.init( this, options );
	};

	/**
	 * create the options object for the TypeAheadTreePicker.
	 */
	$.fn.TypeAheadTreePicker.options = {
		serverSide: false,
		delay: 400,
		loadChildNodes: null,
		serverSearch: null
	};
} )( jQuery, window, document, Handlebars );
