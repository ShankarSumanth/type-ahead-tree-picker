( function ( $ ) {
	"use strict";

	var completeData = [ {
		node: true,
		parentId: -1,
		id: 0,
		label: "World",
		data: [ {
			node: true,
			parentId: 0,
			id: 10,
			label: "Europe",
			data: [ {
				node: false,
				parentId: 10,
				id: 100,
				label: "Germany"
			}, {
				node: false,
				parentId: 10,
				id: 200,
				label: "France"
			}, {
				node: false,
				parentId: 10,
				id: 300,
				label: "Spain"
			}, {
				node: false,
				parentId: 10,
				id: 400,
				label: "Italy"
			} ]
		}, {
			node: true,
			parentId: 0,
			id: 20,
			label: "Asia",
			data: [ {
				node: false,
				parentId: 20,
				id: 500,
				label: "India"
			}, {
				node: false,
				parentId: 20,
				id: 600,
				label: "China"
			}, {
				node: false,
				parentId: 20,
				id: 700,
				label: "Japan"
			}, {
				node: false,
				parentId: 20,
				id: 800,
				label: "Korea South"
			}, {
				node: false,
				parentId: 20,
				id: 900,
				label: "Korea North"
			} ]
		} ]
	} ];

	var data = [ {
		node: true,
		parentId: -1,
		id: 0,
		label: "World",
		data: [ {
			node: true,
			parentId: 0,
			id: 10,
			label: "Europe",
			data: [ {
				node: false,
				parentId: 10,
				id: 100,
				label: "Germany"
			}, {
				node: false,
				parentId: 10,
				id: 200,
				label: "France"
			}, {
				node: false,
				parentId: 10,
				id: 300,
				label: "Spain"
			}, {
				node: false,
				parentId: 10,
				id: 400,
				label: "Italy"
			} ]
		}, {
			node: true,
			parentId: 0,
			id: 20,
			label: "Asia"
		} ]
	} ];

	var asiaChildren = [ {
		node: false,
		parentId: 20,
		id: 500,
		label: "India"
	}, {
		node: false,
		parentId: 20,
		id: 600,
		label: "China"
	}, {
		node: false,
		parentId: 20,
		id: 700,
		label: "Japan"
	}, {
		node: false,
		parentId: 20,
		id: 800,
		label: "Korea South"
	}, {
		node: false,
		parentId: 20,
		id: 900,
		label: "Korea North"
	} ];

	var find = function ( pattern, data, parentNode ) {
		var keepChildren = true;
		for ( var i = data.length - 1; i >= 0; i-- ) {
			var node = data[ i ];
			if ( node.data ) {
				find( pattern, node.data, node );
			}
			if ( keepChildren ) {
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
	};

	$( "#treePickerInputField" )
		.TypeAheadTreePicker( {
			serverSide: true,
			data: data,
			keepChildren: true,
			loadChildNodes: function ( id ) {
				// the id of the node that was clicked to load children
				return asiaChildren;
			},
			serverSearch: function ( pattern ) {
				return find( pattern, completeData, true );
			}

		} );
} )( jQuery );
