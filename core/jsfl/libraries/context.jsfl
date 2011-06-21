// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████              ██                ██   
//  ██                  ██                ██   
//  ██     █████ █████ █████ █████ ██ ██ █████ 
//  ██     ██ ██ ██ ██  ██   ██ ██ ██ ██  ██   
//  ██     ██ ██ ██ ██  ██   █████  ███   ██   
//  ██     ██ ██ ██ ██  ██   ██    ██ ██  ██   
//  ██████ █████ ██ ██  ████ █████ ██ ██  ████ 
//
// ------------------------------------------------------------------------------------------------------------------------
// Context - Provides a convenient access to the major DOM elements

	// --------------------------------------------------------------------------------
	// Constructor
	
		/**
		 * Context object supplies the "this" context for all iterative operations' callbacks
		 * 
		 * @param	dom			{Context}			A Context object with a valid dom property
		 * @param	dom			{Boolean}			Pass true to grab the current Document DOM
		 * @param	dom			{Document}			A Document
		 * 
		 * @param	timeline	{Context}			A Context object with a valid timline property
		 * @param	timeline	{Boolean}			Pass true to grab the current timeline
		 * @param	timeline	{SymbolInstance}	A Symbol Instance
		 * @param	timeline	{SymbolItem}		A SymbolItem
		 * @param	timeline	{Timeline}			A Symbol Item's timeline reference
		 * 
		 * @param	layer		{Context}			A Context object with a valid layer property
		 * @param	layer		{Boolean}			Pass true to grab the curent layer
		 * @param	layer		{String}			The name of the layer
		 * @param	layer		{Number}			The 0-based index of the layer
		 * @param	layer		{Layer}				A Layer
		 * 
		 * @param	frame		{Context}			A Context object with a valid frame property
		 * @param	timeline	{Boolean}			Pass true to grab the current frame
		 * @param	frame		{String}			The name of the frame
		 * @param	frame		{Number}			The 0-based index of the frame
		 * @param	frame		{Frame}				A Frame
		 * 
		 * @param	element		{Context}			A Context object with a valid element property
		 * @param	element		{String}			The name of the element
		 * @param	element		{Number}			The 0-based index of the element
		 * @param	element		{Element}			An element
		 */
		Context = function(dom, timeline, layer, frame, element)
		{
			// --------------------------------------------------------------------------------
			// dom
			
				// private variable
				var _dom;
			
				this.__defineSetter__('dom', 
				/**
				 * Set the DOM of the Context object
				 * @param	value	{Context}	A Context object with a valid dom property
				 * @param	value	{Boolean}	Pass true to grab the current Document DOM
				 * @param	value	{Document}	A Document
				 * @returns		
				 */
				function(value)
				{
					// true
						if(value === true)
						{
							_dom = fl.getDocumentDOM();
						}
					// Document
						else if(value instanceof Document)
						{
							_dom = value;
						}
					// Context
						else if(value instanceof Context)
						{
							_dom = value.dom;
						}
					// return
						return this;
				});
			
				this.__defineGetter__('dom', 
				function()
				{
					return _dom;
				});
			
			// --------------------------------------------------------------------------------
			// timeline
			
				// private variable
				var _timeline;
			
				this.__defineSetter__('timeline', 
				/**
				 * Set the Timeline of the Context object
				 * @param	value	{Boolean}			Pass true to grab the current timeline
				 * @param	value	{Context}			A Context object with a valid timline property
				 * @param	value	{SymbolItem}		A SymbolItem
				 * @param	value	{SymbolInstance}	A Symbol Instance
				 * @param	value	{Timeline}			A Symbol's timeline reference
				 * @returns		
				 */
				function(value)
				{
					// exit early if no dom
						if( ! _dom )
						{
							return this;
						}
					// Timeline or true
						if(value instanceof Timeline || value === true)
						{
							_timeline = value === true ? _dom.getTimeline() : value;
							for each(var item in _dom.library.items)
							{
								if(item instanceof SymbolItem && item.timeline === _timeline)
								{
									_item = item;
									break;
								}
							}
						}
					// Library item
						else if(value instanceof SymbolItem)
						{
							_item		= value;
							_timeline	= _item.timeline;
						}
					// Stage instace
						else if(value instanceof SymbolInstance)
						{
							_item		= value.libraryItem;
							_timeline	= _item.timeline;
						}
					// Context
						else if(value instanceof Context)
						{
							_timeline = value.timeline;
						}
					// return
						return this;
				});
			
				this.__defineGetter__('timeline', 
				function()
				{
					return _timeline;
				});
			
			// --------------------------------------------------------------------------------
			// layer
			
				// private variable
				var _layer;
			
				this.__defineSetter__('layer', 
				/**
				 * Set the Layer of the Context object
				 * @param	value	{Context}	A Context object with a valid layer property
				 * @param	value	{Boolean}	Pass true to grab the curent layer
				 * @param	value	{String}	The name of the layer
				 * @param	value	{Number}	The 0-based index of the layer
				 * @param	value	{Layer}		A Layer
				 * @returns		
				 */
				function(value)
				{
					// exit early if no timeline
						if( ! _timeline )
						{
							return this;
						}
					// Layer index or Layer name
						if(typeof value === 'string' || typeof value === 'number')
						{
							// variables
								var index	= typeof context == 'string' ? timeline.findLayerIndex(value) || -1 : value;
								var layer	= _timeline.layers[index];
								
							// grab layer
								if(layer)
								{
									_layer = layer;
								}
								else
								{
									throw new Error('xjsfl.iterators.frames(): Invalid Layer reference ' +value);
								}
						}
					// true
						else if(value === true)
						{
							_layer = _timeline.layers[_timeline.currentLayer];
						}
					// Layer
						else if(value instanceof Layer)
						{
							_layer = value;
						}
					// Context
						else if(value instanceof Context)
						{
							_layer = value.layer;
						}
					// return
						return this;
				});
			
				this.__defineGetter__('layer', 
				function()
				{
					return _layer;
				});
			
			// --------------------------------------------------------------------------------
			// frame
			
				// private variable
				var _frame;
			
				this.__defineSetter__('frame', 
				/**
				 * Set the Frame of the Context object
				 * @param	value		{Context}	A Context object with a valid frame property
				 * @param	value		{Boolean}	Pass true to grab the current frame
				 * @param	value		{String}	The name of the frame
				 * @param	value		{Number}	The 0-based index of the frame
				 * @param	value		{Frame}		A Frame
				 * @param	allLayers	{Boolean}	Optionally search all layers, when specifying a named frame
				 * @returns		
				 */
				function(value)
				{
					// exit early if no layer
						if( ! _layer )
						{
							return this;
						}
					// Frame index
						if(typeof value === 'number')
						{
							if(value > 0 && value < _layer.frameCount)
							{
								_frame = _layer.frames[value];
							}
						}
					// true
						else if(value === true)
						{
							_frame = _layer.frames[_timeline.currentFrame];
						}
					// Frame
						else if(value instanceof Frame)
						{
							_frame = value;
						}
					// Context
						else if(value instanceof Context)
						{
							_frame = value.frame;
						}
					// Frame name
						else if(typeof value === 'string')
						{
							var index = 0;
							while(index++ < _layer.frameCount)
							{
								if(_layer.frames[index].name == value)
								{
									_frame = _layer.frames[index];
									return this;
								}
							}
						}
					// return
						return this;
				});
			
				this.__defineGetter__('frame', 
				function()
				{
					return _frame;
				});
			
			// --------------------------------------------------------------------------------
			// keyframe
			
				// private variable
				var _keyframe;
			
				this.__defineSetter__('keyframe', 
				/**
				 * Set the Keyframe of the Context object
				 * @param	keyframe	{Number}		The 0-based keyframe index of the frame you want to target (e.g. passing a value of 1 might select the 2nd keyframe, on frame 12)
				 * @param	layer		{Context}		A Context object with a valid layer property
				 * @param	layer		{Boolean}		Pass true to grab the curent layer
				 * @param	layer		{String}		The name of the layer
				 * @param	layer		{Number}		The 0-based index of the layer
				 * @param	layer		{Layer}			A Layer
				 * @returns		
				 */
				function(value)
				{
					// update the layer, if supplied
						if(layer)
						{
							this.layer = layer;
						}
					// exit early if no timeline
						if( ! _timeline )
						{
							return this;
						}
					// find the keyframe
						var index		= 0;
						var keyIndex	= 0;
						while(index < _layer.frameCount)
						{
							if(_layer.frames[index].startFrame == index)
							{
								if(keyIndex == keyframe)
								{
									this.frame = index;
									return this;
								}
								keyIndex++
							}
							index++;
						}
					// return
						return this;
				});
			
				this.__defineGetter__('keyframe', 
				function()
				{
					return _keyframe;
				});

			// --------------------------------------------------------------------------------
			// element
			
				// private variable
				var _element;
			
				this.__defineSetter__('element', 
				/**
				 * Set the Element of the Context object
				 * @param	value	{Context}		A Context object with a valid element property
				 * @param	value	{String}		The name of the element
				 * @param	value	{Number}		The 0-based index of the element
				 * @param	value	{Element}		An element
				 * @returns		
				 */
				function(value)
				{
					// exit early if no frame
						if( ! _frame )
						{
							return this;
						}
					// Element
						if(value instanceof Element)
						{
							_element = value;
						}
					// Element index
						else if(typeof value === 'number')
						{
							_element = _frame.elements[value];
						}
					// Element name
						if(typeof value === 'string')
						{
							var i = 0;
							_element = null;
							while(i < _frame.elements.length)
							{
								if(_frame.elements[i]['name'] == value)
								{
									_element = _frame.elements[i];
									break;
								}
							}
						}
					// return
						return this;
				});
			
				this.__defineGetter__('element', 
				function()
				{
					return _element;
				});
			
			// initialize
				this.dom		= dom;
				this.timeline	= timeline;
				this.layer		= layer;
				this.frame		= frame;
				this.element	= element;
				
			// return
				return this;
		}
		
	// --------------------------------------------------------------------------------
	// Static methods
	
		/**
		 * Factory method provides the quickest way to get the current context
		 * @param	dom			{Boolean} An optional flag to not create a dom context
		 * @param	timeline	{Boolean} An optional flag to not create a timeline context
		 * @param	layer		{Boolean} An optional flag to not create a layer context
		 * @param	frame		{Boolean} An optional flag to not create a frame context
		 * @returns				{Context}
		 */
		Context.create = function(dom, timeline, layer, frame)
		{
			// create a new context
				var context = new Context
				(
					dom === false ? false : true,
					timeline === false ? false : true,
					layer === false ? false : true,
					frame === false ? false : true
				);
				
			// update the stage & return
				if(context.dom)
				{
					context.dom.livePreview = true;
					return context;
				}
				else
				{
					return null;
				}
		}	
	
	// --------------------------------------------------------------------------------
	// Prototype
	
		Context.prototype =
		{
			// --------------------------------------------------------------------------------
			// properties
			
				/**
				 * @type {Document}
				 */
				dom:null,
			
				/**
				 * @type {Item}
				 */
				item:null,
			
				/**
				 * @type {Timeline}
				 */
				timeline:null,
			
				/**
				 * @type {Layer}
				 */
				layer:null,
			
				/**
				 * @type {Frame}
				 */
				frame:null,
			
				/**
				 * @type {Element}
				 */
				element:null,
			
			// --------------------------------------------------------------------------------
			// methods
			
				/**
				 * If the Context object has an item, edit it
				 * @returns		{Context}
				 */
				edit:function()
				{
					if(this.item)
					{
						this.dom.library.editItem(this.item.name);
					}
					return this;
				},
				
				/**
				 * Select the current Layer of the Context object
				 * @param	addToSelection	
				 * @returns		
				 */
				selectLayer:function(addToSelection)
				{
					//TODO Make sure this works!
					if(this.timeline && this.layer)
					{
						var layerIndex	= this.timeline.findLayerIndex(this.layer.name);
						if(layerIndex != undefined)
						{
							this.timeline.setSelectedLayers(layerIndex[0], ! addToSelection);
						}
					}
					return this;
				},
				
				/**
				 * Select the current Frame of the Context object
				 * @param	addToSelection	
				 * @returns		
				 */
				selectFrame:function(addToSelection)
				{
					if(this.timeline && this.layer && this.frame)
					{
						var layerIndex	= this.timeline.findLayerIndex(this.layer.name);
						if(layerIndex != undefined)
						{
							this.timeline.setSelectedLayers(layerIndex[0], ! addToSelection);
							//this.timeline.setSelectedFrames(this.frame.startFrame, this.frame.startFrame + this.frame.duration, ! addToSelection);
							this.timeline.currentFrame = this.frame.startFrame;
						}
					}
					return this;
				},
				
			// --------------------------------------------------------------------------------
			// utilities
			
				/**
				 * Manual method to get context when being used as a scope object in callbacks
				 * @returns		{Context}
				 */
				getContext:function()
				{
					return this;
				},
				
				/**
				 * Updates all parameters of the Context Object with the current UI values
				 * @param		
				 * @returns		
				 */
				update:function()
				{
					this.constructor.call(true, true, true, true, 0);
				},
				
				/**
				 * Returns a copy of the Context object
				 * @returns	{Context}
				 */
				clone:function()
				{
					return new Context(this.dom, this.timeline, this.layer, this.frame, this.element);
				},
				
				/**
				 * Return a String representation of the Context object
				 * @returns		{String}
				 */
				toString:function()
				{
					var str = '[object Context';
					if(this.dom)
						str += ' dom="' +this.dom.name+ '"';
					if(this.item)
						str += ' item="' +this.item.name+ '"';
					if(this.layer)
						str += ' layer[' +this.timeline.currentLayer+ ']="' +this.layer.name+ '"';
					if(this.frame)
						str += ' frame="' +this.frame.startFrame+ '"';
					if(this.element)
						str += ' element="' +this.element.name+ '"';
					return str + ']'
				}
		}
		
// -----------------------------------------------------------------------------------------------------------------------------------------
// Test code
	
	if( ! xjsfl.loading )
	{
		// initialize
			xjsfl.reload();
			clear();
			try
			{
		
		// --------------------------------------------------------------------------------
		// Select a layer
		
			if(1)
			{
				Timer.start();
				for(var i = 0; i < 10000; i++)
				{
					var context = Context.create();
				}
				Timer.stop();
				if(context)
				{
					for(var i = 0; i < context.timeline.layerCount; i+=2)
					{
						//context.setLayer(i).selectLayer(true)
						//trace(context)
						//var layer = context.timeline.layers[i];
						//trace(layer.name)
					}
						context.timeline.setSelectedLayers(0);
						trace(context);
		
						Output.inspect(context, 1, 'Help!')
					
				}
			}
		
			if(0)
			{
				var context = new Context(true,true,true,true);
				context.selectLayer();
				trace(context);
			}
		
		// --------------------------------------------------------------------------------
		// Select a couple of layers
		
			if(0)
			{
				var context = Context.create();
				for each(var index in [0,1,2,3,4,5,6,7])
				{
					context.setLayer(index).selectLayer(true);
				}
				trace(context);
			}
		
		// --------------------------------------------------------------------------------
		// Select a layer and frame
		
			if(0)
			{
				var context = Context.create();
				context.setKeyframe(1).select();
				trace(context);
			}
		
		// --------------------------------------------------------------------------------
		// Select a keyframe
		
			if(0)
			{
				var context = Context.create();
				context.setKeyframe(1).select();
				trace(context);
			}
		
		// --------------------------------------------------------------------------------
		// Selection
		
			if(0)
			{
				fl.getDocumentDOM().addNewOval(new Bounds(100, 100, 100, 100));
				dom.selection		= Context.create().frame.elements;
			}
		
		// catch
			}catch(err){xjsfl.output.error(err);}
	}
		
