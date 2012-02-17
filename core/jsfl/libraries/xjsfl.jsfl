// ------------------------------------------------------------------------------------------------------------------------
//
//           ██ ██████ ██████ ██
//           ██ ██     ██     ██
//  ██ ██    ██ ██     ██     ██
//  ██ ██    ██ ██████ █████  ██
//   ███     ██     ██ ██     ██
//  ██ ██    ██     ██ ██     ██
//  ██ ██ █████ ██████ ██     ██████
//
// ------------------------------------------------------------------------------------------------------------------------
// xJSFL - Rapid development framework for extending Adobe Flash

	/**
	 * http://www.xjsfl.com
	 *
	 * Copyright 2012, Dave Stewart
	 * @see Licence at http://www.xjsfl.com/license
	 *
	 */

	// --------------------------------------------------------------------------------
	// setup

		/**
		 * Fake xjsfl instantation for Komodo autocomplete
		 */
		if( ! xjsfl )
		{
			xjsfl = { };
		}

		(function()
		{
			// if pre-CS4, extend FLfile to add platform to uri conversion (needs to be loaded in advance because of various file / path operations during setup)
			   if( ! FLfile['platformPathToURI'] )
			   {
				   var path = 'jsfl/libraries/flfile.jsfl';
				   xjsfl.output.trace('loading "{core}' +path+ '"');
				   fl.runScript(xjsfl.uri + 'core/' + path);
			   }

		   // ensure temp folder exists
				var uri = xjsfl.uri + 'core/temp/';
				if( ! FLfile.exists(uri) )
				{
					FLfile.createFolder(uri);
				}
		})()

// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████        ██    ██   ██
//  ██            ██    ██
//  ██     █████ █████ █████ ██ █████ █████ █████
//  ██████ ██ ██  ██    ██   ██ ██ ██ ██ ██ ██
//      ██ █████  ██    ██   ██ ██ ██ ██ ██ █████
//      ██ ██     ██    ██   ██ ██ ██ ██ ██    ██
//  ██████ █████  ████  ████ ██ ██ ██ █████ █████
//                                       ██
//                                    █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Settings - Core settings and cached variables

	/**
	 *
	 */
	xjsfl.settings =
	{
		/**
		 * Application data
		 * Information about the Flash version the user is currently running
		 */
		app:
		{
			// Apple: "mac" | Windows: "win"
				platform:	fl.version.substr(0, 3).toLowerCase(),

			// the product name of flash, i.e. CS4
				name:		(function(){
								var version = fl.version.match(/\w+ (\d+)/)[1];
								var name = {'9':'CS3', '10':'CS4', '11':'CS5', '12':'CS6'};
								return name[version] || 'Unknown';
							})(),

			// the integer version of Flash
				version:	parseInt(fl.version.match(/\w+ (\d+)/)[1]),

			// the CS version of Flash
				csVersion:	parseInt(fl.version.match(/\w+ (\d+)/)[1]) - 6

		},

		/**
		 * Folder URIs
		 * Common folders which developers may wish to reference from within scripts or plugins
		 */
		folders:
		{
			// properties
				xjsfl:		xjsfl.uri,
				core:		xjsfl.uri + 'core/',
				modules:	xjsfl.uri + 'modules/',
				user:		xjsfl.uri + 'user/',
				flash:		fl.configURI,
				swf:		fl.configURI + 'WindowSWF/',

			// methods
				add:function(name, uri)
				{
					if( ! /^(all|add)$/.test(this.name) )
					{
						this[name] = URI.toURI(uri);
					}
				},

				/** @type {Array}	An Array of all registered placeholder URIs in reverse-order (for searching) */
				get all()
				{
					var uris = [];
					for(var name in this)
					{
						if( ! /^(all|add)$/.test(name) )
						{
							uris.push(this[name]);
						}
					}
					return uris.sort().reverse();
				}
		},

		/**
		 * Search paths
		 * A cache of uris which xJSFL searches in order when loading files
		 * module uris are updated automatically when new modules are added
		 */
		uris:
		{
			// properties
				core:	[ xjsfl.uri + 'core/' ],
				module: [ ],
				user:	[ xjsfl.uri + 'user/' ],

			// methods
				add:function(pathOrURI, type)
				{
					// check uri is valid
						var uri = URI.toURI(pathOrURI);

					// check URI exists
						if( ! FLfile.exists(uri))
						{
							throw new URIError('Error in xjsfl.settings.uris.add(): URI "' +uri+ '" does not exist');
						}

					// variables
						type	= type || 'user';
						uri		= uri.replace(/[\/]+$/g, '') + '/';	// ensure a single trailing slash

					// add if not already added
						if(this[type].indexOf(uri) == -1)
						{
							this[type].push(uri);
						}
				},

				/** @type {Array}	An Array of all search URIs */
				get all()
				{
					var uris = xjsfl.settings.uris;
					return [].concat(uris.core)
								.concat(uris.module)
								.concat(uris.user);
				}
		},

		/**
		 * Newline character depending on PC or Mac
		 * @type {String}
		 */
		newLine:fl.version.substr(0, 3).toLowerCase() === 'win' ? '\r\n' : '\n'

	}

// ------------------------------------------------------------------------------------------------------------------------
//
//  █████        ██
//  ██  ██       ██
//  ██  ██ █████ █████ ██ ██ █████
//  ██  ██ ██ ██ ██ ██ ██ ██ ██ ██
//  ██  ██ █████ ██ ██ ██ ██ ██ ██
//  ██  ██ ██    ██ ██ ██ ██ ██ ██
//  █████  █████ █████ █████ █████
//                              ██
//                           █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Debug

	xjsfl.debug =
	{
		_error:false,

		_runScript:fl.runScript,

		/*
		init:function(scope, state)
		{
			// variables
				state = state !== false;
				var fl = scope.flash || flash;

			// set or reset functions
				if(state)
				{
					// delegate loading functionality
						if(fl.runScript !== xjsfl.debug.file)
						{
							xjsfl.output.trace('Turning file debugging: on');
							fl.runScript = xjsfl.debug.file;
						}

					// clear the debug log
						xjsfl.debug.clear();
				}
				else
				{
					if(xjsfl.settings.flags.debugging)
					{
						xjsfl.output.trace('Turning file debugging: off');
						fl.runScript = xjsfl.debug._runScript;
						delete fl._runScript;
					}
				}

			// debug
				xjsfl.output.trace('File debugging is: ' + (state ? 'on': 'off'));
		},
		*/

		/**
		 * Debugs script files by loading and eval-ing them
		 * @param	{String}	uriOrPath	The URI or path of the file to load
		 */
		file:function(uriOrPath)
		{
			// make uri
				var uri = URI.toURI(uriOrPath, 1);

			if(FLfile.exists(uri))
			{
				// Turn on file debugging if not yet set
					var state = false;
					if( ! this.state )
					{
						xjsfl.debug._error	= false;
						state				= true;
						this['state'] = true; // brackets used, otherwise Komodo puts state above func in the code outliner
					}

				// debug
					xjsfl.output.trace('Debugging "' + FLfile.uriToPlatformPath(uri) + '"...');

				// test the new file
					var jsfl = FLfile.read(uri).replace(/\r\n/g, '\n');
					try
					{
						// test file
							eval(jsfl);

						// turn off file debugging if this load was the initial load
							if(state)
							{
								this['state'] = false;
							}

						// return
							return true;
					}

				// log errors if there are any
					catch(err)
					{
						//Output.inspect(err)

						// create a new error object the first time an error is trapped
							if( ! xjsfl.debug._error)
							{
								// flag
									xjsfl.debug._error = true;

								// variables
									var evalLine	= 270;	// this needs to be the actual line number of the eval(jsfl) line above
									var line		= parseInt(err.lineNumber) - (evalLine) + 1;

								// turn off debugging
									this['state'] = false;

								// create a new "fake" error
									var error			= new Error(err.name + ': ' + err.message);
									error.name			= err.name;
									error.lineNumber	= line;
									error.fileName		= uri;

								// log the "fake" error
									xjsfl.debug.log(error);

								// throw the new error so further script execution is halted
									throw(error)
							}

						// re-throw the fake error (this only occurs in higher catches)
							else
							{
								throw(err);
							}
					}
			}
			else
			{
				throw(new URIError('URIError: The uri "' +uri+ '" does not exist'));
			}

		},

		/**
		 * Tests a callback and outputs the error stack if the call fails. Add additional parameters after the callback reference
		 * @param	{Function}	fn			The function to test
		 * @param	{Array}		params		An array or arguments to pass to the function
		 * @param	{Object}	scope		An alternative scope to run the function in
		 * @returns	{Value}					The result of the function if successful
		 */
		func:function(fn, params, scope)
		{
			// feedback
				xjsfl.output.trace('testing function: "' + Source.parseFunction(fn).signature + '"');

			// test!
				try
				{
					return fn.apply(scope || this, params);
				}
				catch(err)
				{
					this.error(err, true);
				}
		},

		/**
		 * Traces a human-readable error stack to the Output Panel
		 *
		 * @param	{Error}		error		A javaScript Error object
		 * @param	{Boolean}	testing		Internal use only. Removes test() stack items
		 */
		error:function(error, testing)
		{
			// variables
				var stack;
				if(error instanceof Error)
				{
					stack	= Utils.getStack(error, true);
					if(testing)
					{
						stack.splice(stack.length - 3, 2);
					}
				}
				else
				{
					error	= new Error(error);
					stack	= Utils.getStack(error, true);
					stack	= stack.slice(1);
				}

			// template uris
				var uriErrors	= xjsfl.uri + 'core/assets/templates/errors/errors.txt';
				var uriError	= xjsfl.uri + 'core/assets/templates/errors/error.txt';

			// reload template if not defined (caused by some kind of bug normally)
				if( ! xjsfl.classes.Template )
				{
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/uri.jsfl');
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/filesystem.jsfl');
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/template.jsfl');
				}

			// build errors
				var content = '';
				for(var i = 0; i < stack.length; i++)
				{
					stack[i].index = i;
					content += new xjsfl.classes.Template(uriError, stack[i]).render(); // reference Template class directly
				}

			// build output
				var data		= { error:error.toString(), content:content };
				var output		= new xjsfl.classes.Template(uriErrors, data).render();

			// set loading to false
				xjsfl.loading = false;

			// trace and return
				fl.trace(output);
				return output;
		},

		/**
		 * Logs the results of an error to the temp directory so Komodo can read in the data
		 *
		 * @param	{String}	uri			The URI of the erroring file
		 * @param	{Number}	line		The line number of the error
		 * @param	{String}	name		The name of the error
		 * @param	{String}	message		The error message
		 */
		log:function(error)
		{
			var data		= [error.fileName, error.lineNumber, error.name, error.message].join('\r\n');
			var state		= FLfile.write(xjsfl.uri + 'core/temp/error.txt', data);
		},

		/**
		 * Clears any existing error logs
		 */
		clear:function()
		{
			var uri = xjsfl.uri + 'core/temp/error.txt';
			if(FLfile.exists(uri))
			{
				FLfile.remove(uri);
			}
		},

		/** @type {Boolean}	Set the file debugging state */
		set state(state)
		{
			//TODO Think about making this a simple boolean, then updating file.load() to check for debug.state == true

			// set or reset functions
				if(state)
				{
					// delegate loading functionality
						if(fl.runScript !== xjsfl.debug.file)
						{
							xjsfl.output.trace('turning file debugging: on');
							fl.runScript = xjsfl.debug.file;
							//fl.trace('>>' + fl.runScript)
						}

					// clear the debug log
						xjsfl.debug.clear();
				}
				else
				{
					if(xjsfl.debug.state)
					{
						xjsfl.output.trace('turning file debugging: off');
						fl.runScript = xjsfl.debug._runScript;
						delete fl._runScript;
					}
				}

			// debug
				xjsfl.output.trace('file debugging is: ' + (state ? 'on': 'off'));

		},

		/** @type {Boolean}	Get the file debugging state */
		get state()
		{
			return fl.runScript === xjsfl.debug.file;
		}
	}

// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████ ██ ██
//  ██        ██
//  ██     ██ ██ █████
//  █████  ██ ██ ██ ██
//  ██     ██ ██ █████
//  ██     ██ ██ ██
//  ██     ██ ██ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// File

	/**
	 * framework-specific file functionality
	 */
	xjsfl.file =
	{
		get loading()
		{
			return xjsfl.file.stack.length > 0;
		},

		stack:[],

		/**
		 * Finds all files of a particular type within the cascading file system
		 *
		 * @param	{String}	type		The folder in which to look in to find the files, @see switch statement
		 * @param	{String}	name		A file name (pass no extension to use default), or partial file path
		 * @param	{Number}	returnType	An optional 0, 1 or -1; 0: all files (default), -1: the last file (user), 1:the first file (core)
		 * @returns	{String}				A single file path if found and return type is 1 or -1, or null if not
		 * @returns	{Array}					An Array of file uris if found, and return type is 0, or null if not
		 */
		find:function(type, name, returnType)
		{
			// --------------------------------------------------------------------------------
			// work out base uri

				// variables
					name = name ? String(name) : '';

				// file-specific variables
					var path, ext, which;

				// switch type
					switch(type)
					{
						// for scripts, return the last file found, from: core, modules, user (jsfl)
						case 'script':
						case 'scripts':
						case 'jsfl':
							path	= 'jsfl/' + name;
							ext		= '.jsfl';
							which	= -1;
						break;

						// for libraries, return all found files, in order: core, modules, user (jsfl)
						case 'lib':
						case 'libs':
						case 'library':
						case 'libraries':
							path	= 'jsfl/libraries/' + name;
							ext		= '.jsfl';
							which	= 0;
						break;

						// for full config path return the last file found from: core, modules, user (xml)
						case 'config':
						case 'settings':
							path	= 'config/' + name;
							ext		= '.xml';
							which	= -1;
						break;

						// for templates, return the last file found, from: core, modules, user (txt, or supplied extension)
						case 'template':
							path	= 'assets/templates/' + name;
							ext		= '.txt';
							which	= -1;
						break;

						// otherwise, return all files found, from: core, modules, user
						default:
							path	= type.replace(/\/+$/g, '') + '/' + name;
							ext		= '';
							which	= 0;
					}

				// add default extension if not provided;
					path += name.match(/\.\w+$/) ? '' : ext;


			// --------------------------------------------------------------------------------
			// find files

				// variables
					var uris		= [];
					var paths		= xjsfl.settings.uris.all;

				// check all paths for files
					for(var i = 0; i < paths.length; i++)
					{
						var uri = paths[i] + path;
						if(FLfile.exists(uri))
						{
							uris.push(uri);
						}
					}

				// return null if no URIs found
					if(uris.length == 0)
					{
						return null;
					}

			// --------------------------------------------------------------------------------
			// return

				// variables
					returnType = Number(returnType || which)

				// return
					if(returnType > 0)
					{
						return uris.shift();
					}
					else if(returnType < 0)
					{
						return uris.pop();
					}
					else
					{
						return uris;
					}
		},

		/**
		 * Attempts to find and run or return files from the cascading file structure.
		 * Parameters and return type vary depending on file type!
		 *
		 * @param	{String}		path	The relative or absolute path, or uri to the file
		 *
		 * @param	{String}		name	The name or path fragment to a file, with or without the file extension
		 * @param	{String}		type	The folder type in which to look (i.e. settings) for the file(s)
		 *
		 * @returns	{Boolean}				A Boolean indicating Whether the file was successfully found and loaded
		 * @returns	{XML}					An XML object of the content of the file, if XML
		 * @returns	{String}				The string content of the file otherwise
		 */
		load:function (path, type)
		{
			/*
				// path types
					if absolute or relative path, attempt to load it
					if type and name, find it, then attempt to load it

				// signatures
					load(path)
					load(name, type)

				// also allow load() to take a wildcard URI, i.e. load('path/to/*.jsfl', true);
			*/

			// variables
				var result	= null;

			// --------------------------------------------------------------------------------
			// Resolve URI

				// a URI was passed in
					if(URI.isURI(path))
					{
						result		= FLfile.exists(path) ? path : null;
					}

				// a single path was passed in, so convert it to a uri
					else if(type == undefined || type === true || type === false)
					{
						var uri		= URI.toURI(path, 1);
						result		= FLfile.exists(uri) ? uri : null;
					}

				// name and type supplied, so find the file we need in the cascading file system
					else
					{
						result = xjsfl.file.find(type, path);
					}

			// --------------------------------------------------------------------------------
			// take action on results

				// if result is null, no files were found
					if(result == null)
					{
						path = URI.toPath(path);
						if(type == null || type === true || type === false)
						{
							var message = 'Error in xjsfl.file.load(): The file "' +path+ '" could not be found';
						}
						else
						{
							var message = 'Error in xjsfl.file.load(): Could not resolve type "' +type+ '" and path "' +path+ '" to an existing file';
						}
						throw(new URIError(message));
					}

				// otherwise, do something with the uri / uris (plural) if more than 1 was found
					else
					{
						var uris = Utils.isArray(result) ? result : [result];

						for each(var uri in uris)
						{
							// variables
								var ext = uri.match(/(\w+)$/)[1];

							// flag
								xjsfl.file.stack.push(uri);

							// log
								xjsfl.output.log('loading "' + URI.asPath(uri, true) + '"');

							// do something depending on extension
								switch(ext)
								{
									case 'jsfl':
										// load JSFL script
											fl.runScript(uri);
											xjsfl.file.stack.pop();

										// detect any JavaScript errors
											var outputURI	= xjsfl.uri + 'core/temp/output-panel.txt';
											fl.outputPanel.save(outputURI);
											var output		= FLfile.read(outputURI);
											FLfile.remove(outputURI);

										// throw a new fake error if the file appeared to load incorrectly
											if(/The following JavaScript error\(s\) occurred:\s*$/.test(output))
											{
												var error		= new Error('<error>', '', 0);
												var stack		= Utils.getStack();
												var matches		= stack[0].code.match(/file:[^"]+/);
												if(matches)
												{
													var errorURI	= String(matches).toString();
													var errorPath	= URI.asPath(errorURI);
													error.message	= 'The file "' +errorPath+ '" contains errors';
													error.fileName	= errorURI;
													error.stack		= error.stack.replace('Error("<error>","",0)@:0', '<unknown>@' +errorPath+ ':0')
													xjsfl.loading	= false;
													throw error;
												}
											}

										// otherwise, just return the URI
											return uri;
									break;

									case 'xul':
									case 'xml':
										var contents	= FLfile.read(uri);
										contents		= contents.replace(/<\?.+?>/, ''); // remove any doc type declaration
										xjsfl.file.stack.pop();
										return new XML(contents);
									break;

									default:
										xjsfl.file.stack.pop();
										return FLfile.read(uri);
								}

						}
					}

			// return
				return undefined;
		},

		/**
		 * Saves data to file
		 * @param	{String}	pathOrURI	The path or URI to save data to
		 * @param	{String}	contents	The data to save
		 * @returns	{Boolean}				true or false depending on the result
		 */
		save:function(pathOrURI, contents)
		{
			var uri			= URI.toURI(pathOrURI, 1)
			var file		= new File(uri);
			file.contents	= contents;
			return file.exists && file.size > 0;
		}
	}


// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████ ██
//  ██     ██
//  ██     ██ █████ █████ █████ █████ █████
//  ██     ██    ██ ██    ██    ██ ██ ██
//  ██     ██ █████ █████ █████ █████ █████
//  ██     ██ ██ ██    ██    ██ ██       ██
//  ██████ ██ █████ █████ █████ █████ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Classes

	/**
	 * Mechanism to store and retrieve libraries into the global (or other)
	 * namespace between external JSFL file executions
	 */
	xjsfl.classes =
	{
		paths:{},

		/**
		 * Load a class or array of classes from disk
		 *
		 * @param	{String}	fileRef		A class filename or path, relative to any jsfl/libraries folder
		 * @param	{String}	fileRef		A wildcard string pointing to a folder, i.e. '//user/jsfl/libraries/*.jsfl'
		 * @param	{Array}		fileRef		An Array of class filepaths
		 * @returns	{xjsfl}					The main xJSFL object
		 */
		load:function(fileRef)
		{
			// detect wildcards
				if(typeof fileRef === 'string' && fileRef.indexOf('*') > -1)
				{
					var uri		= URI.toURI(fileRef, 1);
					var pathURI	= URI.getPath(uri);
					var files	= FLfile.listFolder(uri, 'files');
					var paths	= [];
					for each(var file in files)
					{
						paths.push(pathURI + file);
					}
				}

			// make sure paths are in an array, so we can treat them all the same
				else
				{
					var paths = fileRef instanceof Array ? fileRef : [fileRef];
				}

			//TODO Add a check to see if we are loading, and if so, only load classes that are not yet defined. Can we do that? Do we need to cache load paths in that case?

			// load classes
				for each(var path in paths)
				{
					if(path.indexOf('xjsfl') === -1) // don't reload load xjsfl
					{
						xjsfl.file.load(path, 'library');
					}
				}

			// return
				return this;
		},

		/**
		 * Loads a class only if not already defined
		 * @param	{String}	name		The class name, such as 'Template', or 'Table'
		 * @returns
		 */
		require:function(name)
		{
			// load path
				var path = this.paths[name];
				if( ! path )
				{
					this.load(name);
				}

			// return
				return this;
		},

		/**
		 * Registers a class/function for later retrieval
		 *
		 * @param	{String}	name		The name of the class / function / object to register
		 * @param	{Object}	obj			The actual class / function / object
		 * @returns	{xjsfl}					The main xJSFL object
		 */
		register:function(name, obj)
		{
			if( ! /^(paths|load|loadFolder|require|register|restore)$/.test(name) )
			{
				xjsfl.classes[name]    = obj;
				var object             = Utils.getStack().pop();
				this.paths[name]       = object.path + object.file;
			}
			return this;
		},

		/**
		 * Internal function that restores a class/function to the supplied namespace
		 *
		 * @param	{string}	name		The name of the class to restore
		 * @param	{Object}	scope		The scope to which the class should be restored to (defaults to window)
		 * @returns	{xjsfl}					The main xJSFL object
		 */
		restore:function(name, scope)
		{
			// restore all classes
				if(typeof name !== 'string')
				{
					scope = name;
					for (name in xjsfl.classes)
					{
						xjsfl.classes.restore(name, scope);
					}
				}

			// restore only one class
				else if(typeof name == 'string')
				{
					if( ! /^load|require|register|restore$/.test(name) )
					{
						//trace('Restoring:' + name)
						scope = scope || window;
						scope[name] = xjsfl.classes[name];
					}
				}

			// return this for chaining
				return this;
		}
	}

// ------------------------------------------------------------------------------------------------------------------------
//
//  ██   ██          ██       ██
//  ███ ███          ██       ██
//  ███████ █████ █████ ██ ██ ██ █████ █████
//  ██ █ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ ██
//  ██   ██ ██ ██ ██ ██ ██ ██ ██ █████ █████
//  ██   ██ ██ ██ ██ ██ ██ ██ ██ ██       ██
//  ██   ██ █████ █████ █████ ██ █████ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Modules

	/**
	 * Dummy properties for Komodo code inteligence
	 */
	xjsfl.modules =
	{
		/**
		 * Gets the manifest for a particular module namespace
		 * @param	{String}	namespace	The namespace of the manifest to get
		 * @returns	{XML}					The manifest XML
		 */
		getManifest:function(namespace){ },


		/**
		 * Gets the Module instance for a particular module namespace
		 * @param	{String}	namespace	The namespace of the module (should match the AS3 and manifest values)
		 * @returns	{Module}				An xJSFL Module instance
		 */
		getModule:function(namespace){ },


		/**
		 * Finds and stores information about all module manifests in the xJSFL/modules (or supplied) folder.
		 * Called in the main bootstrap, and can be called manually in the user bootstrap to add other folders.
		 * @param	{String}	uri			An optional folder URI to search in, defaults to xJSFL/modules/
		 * @returns	{xjsfl}					The main xJSFL object
		 */
		find:function(uri){ },


		/**
		 * Runs the module bootstrap to load code locally into the host panel
		 * @param	{String}	namespace	The namespace of the module to initialize
		 */
		load:function(namespace){ },


		/**
		 * Factory method to create an xJSFL module instance
		 * @param	{String}	namespace	The namespace of the module (should match the AS3 and manifest values)
		 * @param	{Object}	properties	The properties of the module
		 * @returns	{Module}				An xJSFL Module instance
		 */
		create:function(namespace, properties){ }
	}

	/**
	 * A namespace in which to store module code to prevent pollution of global
	 * scope as well as a couple of methods to add and load module code
	 *
	 * Needs to be created in a closure to keep the modules and manifests private
	 */
	xjsfl.modules =
	(
		/**
		 * The module loading process goes like this...
		 *
		 * 1 - 	All modules reside in their own folder, with a manifest.xml in the root, and a
		 * 		bootstrap.jsfl in jsfl. The manifest stores all information about the module, and
		 * 		the bootstrap contains optional JSFL code that the module needs to run on startup.
		 *
		 * 2 - 	During the main xJSFL bootstrap, xjsfl.modules.find() is called, to search the main
		 *		modules folder for modules' manifest.xml files. Note that find() can also be called
		 *		manually from the user bootstrap to initialize modules external to the xJSFL modules
		 *		folder.
		 *
		 * 3 -	For any modules that are found, xjsfl.modules.init(path) is called and the module's
		 *		manifest information is cached, and any panel SWFs are copied to the WindowSWF folder.
		 *		Note that no modules instances are instantiated yet.
		 *
		 * 4 -	When any panels are opened, xjsfl.modules.load(namespace) is called via MMExecute()
		 * 		from the AbtractModule.initialize() function. This loads the module's bootstrap.jsfl
		 *		file, which should in turn load the module's main JSFL file which contains the module's
		 *		JSFL properties and method. This file then calls...
		 *
		 * 5 -	...xjsfl.modules.create(), which creates and registers the module internally, so it
		 *		can be retrieved if necessary via xjsfl.modules.getModule(namespace)
		 *
		 */

		function()
		{
			/**
			 * A private reference to all found manifests
			 */
			var manifests = {};

			/**
			 * A private reference to all loaded modules
			 */
			var modules = {};

			/**
			 * The property object that will be returned as xjsfl.modules
			 */
			var obj =
			{
				/**
				 * Gets the manifest for a particular module namespace
				 * @param	{String}	namespace	The namespace of the manifest to get
				 * @returns	{XML}					The manifest XML
				 */
				getManifest:function(namespace)
				{
					var manifest = manifests[namespace];
					if(manifest)
					{
						return manifest;
					}
					throw new Error('xjsfl.modules.getManifest(): there is no manifest registered under the namespace "' +namespace+ '"');
				},

				/**
				 * Gets the Module instance for a particular module namespace
				 * @param	{String}	namespace	The namespace of the module (should match the AS3 and manifest values)
				 * @returns	{Module}				An xJSFL Module instance
				 */
				getModule:function(namespace)
				{
					var module = modules[namespace];
					if(module)
					{
						return module;
					}
					throw new Error('xjsfl.modules.getModule(): there is no module registered under the namespace "' +namespace+ '"');
				},

				/**
				 * Finds and stores information about all module manifests in the xJSFL/modules (or supplied) folder.
				 * Called in the main bootstrap, and can be called manually in the user bootstrap to add other folders.
				 * @param	{String}	uri			An optional folder URI to search in, defaults to xJSFL/modules/
				 * @returns	{xjsfl}					The main xJSFL object
				 */
				find:function(uri)
				{
					// callback function to process files and folders
						function processFile(element)
						{
							if(element instanceof Folder)
							{
								// skip folders where manifests shouldn't be
								if(/assets|config|docs|temp|ui/.test(element.name))
								{
									return false;
								}
							}
							// if a manifest is found, initialize it
							else if(element.name === 'manifest.xml')
							{
								xjsfl.modules.init(element.parent.uri);
								return false;
							}
						};

					// find and load modules automatically
						Data.recurseFolder(uri || xjsfl.settings.folders.modules, processFile);

					// return
						return this;
				},

				//TODO Does init() need to be public? Consider making it private

				/**
				 * Initializes, but does not instantiate a module, by caching its manifest files, and copying
				 * any panel resources to the Flash/WindowSWF folder, and commands to the Commands folder
				 *
				 * @param	{String}	folderNameOrURI		The module folder name or path, relative to xJSFL/modules/ i.e. "Snippets", or an absolute URI
				 */
				init:function(folderNameOrURI)
				{
					// ensure path has a trailing slash
						folderNameOrURI = folderNameOrURI.replace(/\/*$/, '/');

					// if path is not a URI, it will probably be a path fragment, so default to the modules folder
						if( ! URI.isURI(folderNameOrURI))
						{
							var uri			= xjsfl.settings.folders.modules + folderNameOrURI;
						}
						else
						{
							var uri			= folderNameOrURI;
						}

					// attempt to load the module's manifest
						var manifest		= xjsfl.file.load(uri + 'manifest.xml');
						if( ! manifest)
						{
							return this;
						}

					// debug
						xjsfl.output.trace('registering module "' +String(manifest.info.name)+ '"');

					// update with the actual URI & store
						manifest.jsfl.uri		= uri;
						var namespace			= String(manifest.jsfl.namespace);
						manifests[namespace]	= manifest;

					// add the URI to the xjsfl.settings.uris.modules and xjsfl.settings.folders objects
						xjsfl.settings.uris.add(uri, 'module');
						xjsfl.settings.folders[namespace] = uri;

					// copy any panels to the WindowSWF folder
						var folder = new xjsfl.classes.Folder(uri + 'ui/');
						for each(var src in folder.files)
						{
							if(src.extension === 'swf')
							{
								// grab any existing target panels
									var trg = new File(fl.configURI + 'WindowSWF/' + src.name);

								// check exists and compare dates
									if(! trg.exists || src.modified > trg.modified)
									{
										xjsfl.output.trace('copying "' + URI.asPath(src.uri, true) + '" to "Flash/Configuration/WindowSWF/"');
										src.copy(fl.configURI + 'WindowSWF/', true);
									}

								// no need to copy if up to date
									else
									{
										xjsfl.output.trace('panel "' + src.name.replace('.swf', '') + '" is already up to date');
									}
							}
						}

					// copy any flash assets
						var srcFolder	= uri + 'flash/';
						var assetURIs	= Data.recurseFolder(srcFolder, true);
						if(assetURIs.length)
						{
							assetURIs = assetURIs.filter(URI.isFile);
							xjsfl.output.trace('copying ' + assetURIs.length + ' asset(s) to "Flash/Configuration/"');
							for each(var srcURI in assetURIs)
							{
								var trgURI = fl.configURI + srcURI.substr(srcFolder.length);
								//xjsfl.output.trace('copying "' + URI.asPath(srcURI, true) + '" to "Flash/Configuration/"');
								new File(srcURI).copy(trgURI, true);
							}
						}

					// preload
						if(String(manifest.jsfl.preload) == 'true')
						{
							this.load(manifest.jsfl.namespace);
						}

					// return
						return this;
				},

				/**
				 * Runs the module bootstrap to load code locally into the host panel
				 * @param	{String}	namespace	The namespace of the module to initialize
				 */
				load:function(namespace)
				{
					var manifest = manifests[namespace];
					if(manifest)
					{
						xjsfl.file.load(String(manifest.jsfl.uri) + 'jsfl/bootstrap.jsfl');
					}
					else
					{
						throw new Error('xjsfl.modules.load(): there is no module registered under the namespace "' +namespace+ '"');
					}
				},

				/**
				 * Factory method to create an xJSFL module instance
				 * @param	{String}	namespace	The namespace of the module (should match the AS3 and manifest values)
				 * @param	{Object}	properties	The properties of the module
				 * @returns	{Module}				An xJSFL Module instance
				 */
				create:function(namespace, properties, window)
				{
					// if manifest is not yet loaded (perhaps in development) attempt to initialize the module
						if( ! manifests[namespace])
						{
							this.init(namespace);
						}

					// create module
						try
						{
							var module = new xjsfl.classes.Module(namespace, properties, window);
							if(module)
							{
								modules[namespace] = module;
							}
							return module;
						}
						catch(err)
						{
							xjsfl.debug.error(err);
						}
				}
			}

			return obj;
		}
	)();


// ------------------------------------------------------------------------------------------------------------------------
//
//  ██  ██ ██
//  ██  ██ ██
//  ██  ██ ██
//  ██  ██ ██
//  ██  ██ ██
//  ██  ██ ██
//  ██████ ██
//
// ------------------------------------------------------------------------------------------------------------------------
// UI


	/**
	 * Global access to XUL UI dialogs
	 */
	xjsfl.ui =
	{
		dialogs:[],

		/**
		 * Show a new XUL dialog, nesting if one is already shown
		 * @param	{XUL}		xul			A valid XUL object
		 * @returns	{Object}				The settings object from the XMLUI
		 */
		show:function(xul)
		{
			// clear dialogs if there's no current XMLUI
				var xulid = fl.xmlui.get('xulid');
				if(xulid == undefined)
				{
					this.dialogs = [];
				}

			// grab new id
				xul.id			= this.dialogs.length;

			// update XML id placeholders with correct id
				 var xml		= xul
									.xml.toXMLString()
									.replace(/{xulid}/g, xul.id)
									.replace(/xjsfl.ui.handleEvent\(0,/g, 'xjsfl.ui.handleEvent(' +xul.id+ ',');

			// save XML to dialog.xml
				var uri			= xul.uri || xjsfl.uri + 'core/temp/dialog.xul';
				xjsfl.file.save(uri, xml);

			// register XUL
				this.dialogs.push(xul);

			// debug
				//Output.list(this.dialogs, null, 'Dialog opened')

			// show
				var settings = $dom.xmlPanel(uri);

			// unregister
				this.dialogs.pop();

			// debug
				//Output.inspect(settings);

			// return settings
				return settings;
		},

		handleEvent:function(xulid, type, id)
		{
			var dialog = this.dialogs[xulid];
			if(dialog)
			{
				dialog.handleEvent(type, id);
			}
		},

		/**
		 * Lightweight function to return the current UI state
		 * @returns	{Object}
		 */
		getState:function()
		{
			//TODO Add in boolean to also get the selected elements
			var obj = {};
			var dom = fl.getDocumentDOM();
			if(dom)
			{
				//BUG CS5.5 won't allow you to get a timeline sometimes
				var timeline = dom.getTimeline();
				obj =
				{
					document:	dom.pathURI || dom.name,
					timeline:	timeline.name,
					layers:		String(timeline.getSelectedLayers()),
					frames:		String(timeline.getSelectedFrames()),
					numLayers:	timeline.layers.length,
					numFrames:	timeline.frameCount,
					selection:	null
				}
			}
			return obj;
		},

	}


// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████                    ██
//  ██                        ██
//  ██     ██ ██ █████ █████ █████ █████
//  █████  ██ ██ ██ ██ ██ ██  ██   ██
//  ██     ██ ██ █████ ██ ██  ██   █████
//  ██      ███  ██    ██ ██  ██      ██
//  ██████  ███  █████ ██ ██  ████ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Events

	// add events stub. event code will be added in core/jsfl/libraries/events.jsfl
		if( ! xjsfl.events )
		{
			xjsfl.events = {};
		}


// ------------------------------------------------------------------------------------------------------------------------
//
//  ██       ██  ██   ██       ██ ██
//  ██           ██            ██
//  ██ █████ ██ █████ ██ █████ ██ ██ ████ █████
//  ██ ██ ██ ██  ██   ██    ██ ██ ██   ██ ██ ██
//  ██ ██ ██ ██  ██   ██ █████ ██ ██  ██  █████
//  ██ ██ ██ ██  ██   ██ ██ ██ ██ ██ ██   ██
//  ██ ██ ██ ██  ████ ██ █████ ██ ██ ████ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Initialize

	/**
	 * These properties are assigned using extend, to remain hidden from Komodo's code-intelligence
	 */
	(function()
	{
		var props =
		{
			/**
			 * Stand toString function
			 * @returns
			 */
			toString:function()
			{
				return '[object xJSFL]';
			}

		}

		Utils.extend(xjsfl, props)

	})()

	/**
	 * Create global variables and functions in supplied scope
	 * @param	scope		{Object}	The scope into which the framework should be extracted
	 * @param	scopeName	{String}	An optional scopeName, which when supplied, traces a short message to the Output panel
	 * @returns
	 */
	xjsfl.initVars = function(scope, scopeName)
	{
		// initialize only if core $dom method is not yet defined
			if(typeof scope.$dom === 'undefined')
			{
				// debug
					if(scopeName)
					{
						xjsfl.output.log('initializing [' +scopeName+ ']');
					}

				// global variables

					// $dom
						scope.__defineGetter__( '$dom', function(){ return fl.getDocumentDOM(); } );

					// $timeline
						scope.__defineGetter__( '$timeline', function(){ var dom = $dom; return dom ? dom.getTimeline() : null; } );

					// $library
						scope.__defineGetter__( '$library', function(){ var dom = $dom; return dom ? dom.library : null; } );

					// $selection
						scope.__defineGetter__( '$selection', function(){ var dom = $dom; return dom ? dom.selection : null; } );
						scope.__defineSetter__( '$selection', function(elements){ var dom = $dom; if(dom){dom.selectNone(); dom.selection = elements} } );

				// global functions

					// output
						scope.trace		= function(){ fl.outputPanel.trace(Array.slice.call(this, arguments).join(', ')) };
						scope.clear		= fl.outputPanel.clear;
						scope.populate	= function(template, properties)
						{
							return new SimpleTemplate(template, properties).output;
						}

					// debugging
						scope.inspect	= function(){ fl.trace('inspect() not yet initialized'); };
						scope.list		= function(){ fl.trace('list() not yet initialized'); };

					// file
						scope.load		= function(pathOrURI)
						{
							return xjsfl.file.load(URI.toURI(pathOrURI, 1));
						}
						scope.save		= function(pathOrURI, contents)
						{
							return xjsfl.file.save(URI.toURI(pathOrURI, 1), contents);
						}

			}
	}

	/**
	 * Initialize the environment by extracting variables / objects / functions to global scope
	 * @param	{Object}	scope			The scope into which the framework should be extracted
	 * @param	{String}	scopeName		An optional id, which when supplied, traces a short message to the Output panel
	 * @returns
	 */
	xjsfl.init = function(scope, scopeName)
	{
		// copy core variables and functions into scope
			xjsfl.initVars(scope, scopeName);

		// debug
			if(scopeName)
			{
				xjsfl.output.trace('copying classes to [' +scopeName+ ']');
			}

		// copy registered classes into scope
			xjsfl.classes.restore(scope);

		// flag xJSFL initialized by setting a scope-level variable (xJSFL, not xjsfl)
			scope.xJSFL		= xjsfl;
	}
