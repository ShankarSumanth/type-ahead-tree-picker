var gulp = require( 'gulp' );
var concat = require( 'gulp-concat' );
var del = require( 'del' );
var uglify = require( 'gulp-uglify' );
var pump = require( 'pump' );
var rename = require( 'gulp-rename' );
var handlebars = require( 'gulp-handlebars' );
var wrap = require( 'gulp-wrap' );
var declare = require( 'gulp-declare' );


gulp.task( 'default', [ 'copy-css',
	'minify-with-dependencies', 'dev-with-dependencies', 'dev-without-dependencies', 'minify-without-dependencies'
] );

gulp.task( 'clean', function () {
	return del( [ 'dist/*', 'js/templates/*', 'temp/*' ] );
} );

gulp.task( 'precompile', [ 'clean' ], function ( cb ) {
	pump( [
			gulp.src( 'template/*.handlebars' ),
			handlebars( {
				handlebars: require( 'handlebars' )
			} ),
			wrap( 'Handlebars.template(<%= contents %>)' ),
			declare( {
				namespace: 'Handlebars.templates',
				noRedeclare: true
			} ),
			gulp.dest( 'js/templates/' )
		],
		cb );
} );

gulp.task( 'concat-templates', [ 'precompile' ], function ( cb ) {
	pump( [
		gulp.src( 'js/templates/*.js' ),
		concat( 'template.js' ),
		gulp.dest( 'temp' )
	], cb );
} );

gulp.task( 'concat-vendors', function ( cb ) {
	pump( [
		gulp.src( [ 'js/vendor/handlebars-4.0.5.runtime.min.js', 'js/vendor/jquery-1.12.0.min.js' ] ),
		concat( 'vendors.js' ),
		gulp.dest( 'temp' )
	], cb );
} );

gulp.task( 'copy-plugin', function ( cb ) {
	pump( [
		gulp.src( 'js/plugins.js' ),
		rename( 'plugin.js' ),
		gulp.dest( 'temp' )
	], cb );
} );

gulp.task( 'copy-css', function ( cb ) {
	pump( [
		gulp.src( 'css/dropdown.css' ),
		gulp.dest( 'dist/css' )
	], cb );
} );

gulp.task( 'minify-with-dependencies', [ 'concat-vendors', 'concat-templates', 'copy-plugin' ], function ( cb ) {
	pump( [
		gulp.src( [ 'temp/vendors.js', 'temp/template.js', 'temp/plugin.js' ] ),
		concat( 'type-ahead-treepicker-with-dependencies.js' ),
		uglify(),
		rename( {
			basename: 'type-ahead-treepicker-with-dependencies',
			suffix: '.min',
			extname: '.js'
		} ),
		gulp.dest( 'dist' )
	], cb );
} );

gulp.task( 'dev-with-dependencies', [ 'concat-vendors', 'concat-templates', 'copy-plugin' ], function ( cb ) {
	pump( [
		gulp.src( [ 'temp/vendors.js', 'temp/template.js', 'temp/plugin.js' ] ),
		concat( 'type-ahead-treepicker-with-dependencies.js' ),
		rename( {
			basename: 'type-ahead-treepicker-with-dependencies',
			extname: '.js'
		} ),
		gulp.dest( 'dist' )
	], cb );
} );

gulp.task( 'dev-without-dependencies', [ 'concat-templates', 'copy-plugin' ], function ( cb ) {
	pump( [
		gulp.src( [ 'temp/template.js', 'temp/plugin.js' ] ),
		concat( 'type-ahead-treepicker-without-dependencies.js' ),
		gulp.dest( 'dist' )
	], cb );
} );

gulp.task( 'minify-without-dependencies', [ 'concat-templates', 'copy-plugin' ], function ( cb ) {
	pump( [
		gulp.src( [ 'temp/template.js', 'temp/plugin.js' ] ),
		concat( 'type-ahead-treepicker-without-dependencies.min.js' ),
		uglify(),
		gulp.dest( 'dist' )
	], cb );
} );
