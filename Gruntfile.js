module.exports = function(grunt) {
	'use strict';
	/**
	 * Livereload and connect variables
	 */
	var LIVERELOAD_PORT = 35729;
	var lrSnippet = require('connect-livereload')({
	  port: LIVERELOAD_PORT
	});

	var mountFolder = function(connect, dir) {
	  return require('serve-static')(require('path').resolve(dir));
	};

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    /**
	 * Grunt module
	 */
    grunt.initConfig({
    	pkg: grunt.file.readJSON('package.json'),
    	clean:{
    		all: [
		        "dist/css",
		        "dist/js",
		        "dist/*.html",
		        "src/styles/css"
		    ]
    	},
    	connect: { //Starts a local webserver and inject livereload snippet
			options: {
				port: 9992,
				hostname: '*'
			},
			livereload: {
				options: {
				  	middleware: function(connect) {
				    	return [lrSnippet, mountFolder(connect, 'dist')];
			  		}
				}
			}
		},
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>'
			}
		},
    	sass:{
    		dev:{
    			options: {
		            outputStyle: 'expanded',
		            sourceMap: true
		        },
		        files: {
					'dist/css/app.min.css' : 'src/styles/sass/app.scss'
		        }
    		},
    		prod:{
    			options: {
		            outputStyle: 'compact',
		            sourceMap: false
		        },
		        files: {
					'src/styles/css/app-unprefixed.css' : 'src/styles/sass/app.scss'
		        }
    		}
    	},
    	autoprefixer:{
    		options: {
				browsers: [
				  'last 2 version',
				  'ie 9'
				]
			},
			dist: {
				src: 'src/styles/css/app-unprefixed.css',
				dest:'src/styles/css/app.css'
			},
    	},
    	cssmin:{
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'dist/css/app.min.css' : 'src/styles/css/app.css'
				}
			}
    	},
    	jshint:{
			options: {
		        reporter: require('jshint-stylish'),
		        globals: {
		        	//jQuery: true
		      	}
		    },
		    all: [
		        'src/scripts/*.js'
		    ]
    	},
    	uglify:{
    		dev:{
    			options:{
    				sourceMap: true,
    				mangle: false
    			},
    			files:[
    				{
    					expand: true,
			            cwd: 'src/scripts',
			            src: '**/*.js',
			            dest: 'dist/js',
			            ext: '.min.js'
    				}
    			]
    		},
    		prod:{
    			options:{
    				sourceMap: false,
    				mangle:{
    					//except: ['jQuery']
    				}
    			},
    			files:[
    				{
    					expand: true,
			            cwd: 'src/scripts',
			            src: '**/*.js',
			            dest: 'dist/js',
			            ext: '.min.js'
    				}
    			]
    		}
    	},
    	usebanner:{
    		all:{
    			options:{
					position: 'top',
					banner: '/*!\n' +
							' * <%= pkg.name %>\n' +
							' * @author: <%= pkg.author %>\n' +
							' * @version: <%= pkg.version %>\n' +
							' * Copyright ' + new Date().getFullYear() +'.\n' +
							' */\n',
					linebreak: true
    			},
    			files:{
    				src:[
    					'dist/css/app.min.css',
    					'dist/js/app.js',
    					'dist/js/app.min.js'
    				]
    			}
    		}
    	},
    	copy:{
    		prod:{
    			files:[
    				{
    					expand: true,
						flatten: true,
						src: 'src/scripts/app.js',
						dest: 'dist/js'
    				}
    			]
    		},
    		init:{
    		    files: [
                    {
                        expand: false,
                        flatten: false,
                        src: 'bower_components/normalize-css/normalize.css',
                        dest: 'src/styles/sass/_normalize.scss'
                    },
    				{
    					//expand: true,
						//flatten: true,
						//src: 'bower_components/jquery/dist/jquery.min.js',
						//dest: 'dist/js/vendor'
    				},
    				{
						expand: true,
						flatten: true,
						src: 'src/favicons/*',
						dest: 'dist/'
					},
					{
						expand: true,
						flatten: true,
						src: 'src/fonts/*',
						dest: 'dist/fonts/'
					}
    			]
    		}
    	},
    	imagemin:{
    		all:{
				options: {
					optimizationLevel: 7,
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }]
				},
				files: [
					{
						expand: true,
						cwd: 'src/images/img/',
						src: ['**/*.{png,jpg,gif,svg}'],
						dest: 'dist/img/'
					}
				]
    		}
    	},
    	includereplace: {
			all: {
				files:[
					{	
						expand: true, 
						flatten: true,
						src: 'src/*.html', 
						dest: 'dist' 
					}
				]
			}
		},
    	watch:{
    		options: {
		        spawn: false,
		        livereload: true
		    },
		    scripts: {
		        files: [
		            'src/scripts/*.js',
		            'src/scripts/**/*.js'
		        ],
		        tasks: [
		            'newer:jshint',
		            'newer:uglify'
		        ]
		    },
		    styles: {
		        files: [
		            'src/styles/sass/*.scss',
		            'src/styles/sass/**/*.scss'
		        ],
		        tasks: [
		            'sass:dev'
		        ]
		    },
		    images:{
				files: ['src/images/img/**/*.{png,jpg,gif,svg}'],
				tasks:['newer:imagemin'],
				options: {
					spawn: false,
					cache: false
				},
			},
			livereload: {
	        	options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'src/*.html',
					'src/templates/*.html',
					'src/js/*.js',
					'dist/css/*.css',
					'dist/img/**/*.{png,jpg,jpeg,gif,svg}'
				]
			},
			html:{
				files: 'src/*.html',
				tasks:'newer:includereplace',
				options: {
					spawn: false,
					cache: false
				}
			},
			templates:{
				files: 'src/templates/*.html',
				tasks:'includereplace',
				options: {
					spawn: false,
					cache: false
				}
			}
    	},
    	concurrent: {
    		options: {
		        limit: 3
		    },
		    // Dev tasks
		    devFirst: [
		        'clean',
		        'jshint'
		    ],
		    devSecond: [
		        'sass:dev',
		        'uglify:dev',
		        'includereplace'
		    ],
		    // Production tasks
		    prodFirst: [
		        'clean',
		        'jshint',
		        'sass:prod'
		    ],
		    prodSecond: [
		        'uglify:prod',
		        'autoprefixer'
		    ],
		    prodThird: [
		        'cssmin',
		        'copy:prod'
		    ],
		    prodFourth: [
		    	'usebanner',
		    	'includereplace'
		    ],

		    // Image tasks
		    imgFirst: [
		        'imagemin'
		    ]
    	}
  	});

	grunt.registerTask('default', [
  		'concurrent:devFirst',
  		'concurrent:devSecond',
  		'concurrent:imgFirst',
  		'copy:init',
	]);
	
  	grunt.registerTask('dev', [
  		'concurrent:devFirst',
  		'concurrent:devSecond',
  		'connect',
  		'open',
  		'watch'
	]);

  	grunt.registerTask('devimg', [
  		'concurrent:devFirst',
  		'concurrent:devSecond',
  		'concurrent:imgFirst',
  		'connect',
  		'open',
  		'watch'
	]);

  	grunt.registerTask('prod', [
  		'concurrent:prodFirst',
  		'concurrent:prodSecond',
  		'concurrent:prodThird',
  		'concurrent:prodFourth',
  		'concurrent:imgFirst'
	]);
};
