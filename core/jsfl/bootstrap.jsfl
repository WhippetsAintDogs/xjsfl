// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████                       ██████              ██          ██
//  ██                           ██  ██              ██          ██
//  ██     █████ ████ █████      ██  ██ █████ █████ █████ █████ █████ ████ █████ █████
//  ██     ██ ██ ██   ██ ██      █████  ██ ██ ██ ██  ██   ██     ██   ██      ██ ██ ██
//  ██     ██ ██ ██   █████      ██  ██ ██ ██ ██ ██  ██   █████  ██   ██   █████ ██ ██
//  ██     ██ ██ ██   ██         ██  ██ ██ ██ ██ ██  ██      ██  ██   ██   ██ ██ ██ ██
//  ██████ █████ ██   █████      ██████ █████ █████  ████ █████  ████ ██   █████ █████
//                                                                               ██
//                                                                               ██
//
// ------------------------------------------------------------------------------------------------------------------------
// Core Bootstrap - Sets up the framework, then loads core classes and modules

	// --------------------------------------------------------------------------------
	// initialize

		(function()
		{
			// clear existing values, in case we need to reload during development
				for(var name in xjsfl)
				{
					if( ! /^(reload|uri|reset|loading|debugState)$/.test(name) )
					{
						delete xjsfl[name];
					}
				}

			// output needs to be created before main library is loaded
				xjsfl.output =
				{
					/**
					 * Traces an "> xjsfl:" message to the Output panel
					 * @param	{String}	message		The message to log
					 * @param	{Boolean}	newLine		An optional Boolean to highlight the message
					 */
					trace:function(message, newLine)
					{
						if(newLine)
						{
							fl.trace('');
							message = String(message).toUpperCase();
						}
						fl.trace('> xjsfl: ' + message);
					},

					/**
					 * Logs a message to the xjsfl log, and optionally traces it
					 * @param	{String}	message		The text of the log message
					 * @param	{Boolean}	newLine		An optional Boolean to highlight the message
					 * @param	{Boolean}	trace		An optional Boolean to trace the message, defaults to true
					 * @param	{Boolean}	clear		An optional Boolean to clear the log file, defaults to false
					 * @returns
					 */
					log:function(message, newLine, trace, clear)
					{
						// trace
							trace = typeof trace !== 'undefined' ? trace : true;
							if(trace)
							{
								this.trace(message, newLine);
							}

						// variables
							var uri		= xjsfl.uri + 'core/temp/xjsfl.log';
							if(newLine)
							{
								message = String(message).toUpperCase();
							}

						// clear
							if(clear)
							{
								FLfile.remove(uri);
								xjsfl.output.log('xjsfl log created');
							}

						// log
							var date	= new Date();
							var time	= date.toString().match(/\d{2}:\d{2}:\d{2}/) + ':' + (date.getMilliseconds() / 1000).toFixed(3).substr(2);
							FLfile.write(uri, (newLine ? '\n' : '') + time + '\t' + message + '\n', 'append');
					}

				}

		})()

	// --------------------------------------------------------------------------------
	// attempt to load framework

		try
		{
			// --------------------------------------------------------------------------------
			// set up

				// log
					xjsfl.output.log('running core bootstrap...', true, true, true)

				// flags
					xjsfl.loading = true;

				// never debug the bootstrap!
					var debugState = false;
					if(xjsfl.debug)
					{
						debugState = xjsfl.debug.state;
						xjsfl.debug.state = false;
					}

				// need to load Utils & URI libraries first as core methods rely on them
					xjsfl.output.log('loading Utils library...');
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/utils.jsfl');

					xjsfl.output.log('loading URI library...');
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/uri.jsfl');

			// --------------------------------------------------------------------------------
			// load core

				// core
					xjsfl.output.log('loading xJSFL...', true);
					fl.runScript(xjsfl.uri + 'core/jsfl/libraries/xjsfl.jsfl');

				// initialize core functions
					xjsfl.output.log('initializing variables...')
					xjsfl.initVars(this, 'window');

				// now, once core has loaded, register URI and Utils library
					xjsfl.classes.register('Utils', Utils);
					xjsfl.classes.register('URI', URI);

				// reset file debugging
					//xjsfl.debug.state = false;

				// load key libraries
					xjsfl.output.log('loading core libraries...', true);
					xjsfl.classes.load(['filesystem', 'uri', 'template', 'output', 'class']);

				// load other libraries
					xjsfl.classes.load('libraries/*.jsfl');

			// --------------------------------------------------------------------------------
			// load modules, then user bootstrap

				// modules
					xjsfl.output.log('loading modules...', true);
					xjsfl.modules.find();

			// --------------------------------------------------------------------------------
			// load user bootstrap & finalise

				// user bootstrap
					xjsfl.output.log('loading user bootstrap...', true);
					xjsfl.file.load('//user/jsfl/bootstrap.jsfl');

				// flags
					xjsfl.loading = false;

				// reset any debugging
					xjsfl.debug.state = debugState;
		}
		catch(error)
		{
			xjsfl.output.log('error running core bootstrap', true);
			fl.runScript(xjsfl.uri + 'core/jsfl/libraries/utils.jsfl');
			fl.runScript(xjsfl.uri + 'core/jsfl/libraries/output.jsfl');
			fl.runScript(xjsfl.uri + 'core/jsfl/libraries/xjsfl.jsfl');
			xjsfl.output.log(xjsfl.debug.error(error), false, false);
		}
