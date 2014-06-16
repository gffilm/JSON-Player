
/*
 * The Global object
 */
var jp = {};

/*
 * Define if production code
 * @define Production code
 */
jp.PRODUCTION = false;


/*
 * Avoids errors if there is not a console
*/
if (!window.console) {
  console = {};
  console.log = function() {};
}


/**
 * Pure-JS implementation of jp.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object
 * @param {...*} var_args Additional arguments
 * @return {!Function} A partially-applied form of the function bind()
 * @private
 */
jp.bindJs = function(fn, selfObj, var_args) {
  var context = selfObj || jp.global,
      newArgs,
      boundArgs;
  if (arguments.length > 2) {
    boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs);
    };

  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
};


/**
 * A native implementation of jp.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj the object itself.
 * @param {...*} var_args Additional arguments
 * @return {!Function} the function to bind
 * @private
 */
jp.bindNative = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments);
};


/**
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object
 * @param {...*} var_args Additional arguments
 * @return {!Function} the function bind()
 */
jp.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind &&
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    jp.bind = jp.bindNative;
  } else {
    jp.bind = jp.bindJs;
  }
  return jp.bind.apply(null, arguments);
};


/*
 * The Utility class
*/
jp.utility = function() {};


/*
 * Gets a uri parameter.
 * @param {string} param the uri param to try for.
 * @return {string} the param or null.
*/
jp.utility.prototype.getUrlParams = function(param) {
  return decodeURIComponent(
    (new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) ||
      [,""])[1].replace(/\+/g, '%20')) || null;

};


/*
 * Finds json data from a haystack.
 * @param {Array} needles the data to look for.
 * @param {Object} haystack the data to search through.
 * @return {*} the data or null.
*/
jp.utility.prototype.findJsonData = function(needles, haystack) {
  var i, needle, found = false;
  for (i in needles) {
    needle = needles[i];
    if (haystack[needle]) {
      haystack = haystack[needle];
      found = true;
    }
  }
  return found ? haystack : null;
};



/*
 * Logs an error
 * @param {jp.errorCodes} error the error object.
 * @param {string=} optInfo optional error information.
*/
jp.error = function(error, optInfo) {
  if (optInfo) {
    console.log('Info:', error['detail'], ' Code:', error['code'], optInfo);
  } else {
    console.log('Info:', error['detail'], ' Code:', error['code']);
  }
};


/*
 * Logs an entry
 * @param {string} name the logging name.
 * @param {string} value the logging value.
*/
jp.log = function(name, value) {
  console.log(name, value);
};


/*
 * The Error objects wih a code and detail
 */
jp.errorCodes = {
  'libraryLoad': {'code': 'loader-001', 'detail': 'Error loading libraries'},
  'jsonLoad': {'code': 'loader-002', 'detail': 'Error loading json files'},
  'dustError': {'code': 'dust-001', 'detail': 'Error parsing dust file'},
  'dustMarkup': {'code': 'dust-002', 'detail': 'Dust markup missing'},
  'layoutMissing': {'code': 'dust-003', 'detail': 'Dust layout missing'},
  'layoutMissingFromConfig': {'code': 'dust-004', 'detail': 'Dust layout missing from config'},
  'layoutContentMissing': {'code': 'dust-005', 'detail': 'Dust layout content missing'},
  'styleMissing': {'code': 'dust-003', 'detail': 'Dust layout missing'},
  'styleMissingFromConfig': {'code': 'css-001', 'detail': 'Styles missing'}
};

/*
 * All event types
*/
jp.events = {
  layoutLoad: 'layoutLoad',
  styleLoad: 'styleLoad',
  styleLoaded: 'styleLoaded',
  elementRendered: 'elementRendered',
  reboot: 'reboot'
};

/*
 * Listens for an event, using anthropomorphic metaphors to descripe the listener
 * @param {string} ear the listening device.
 * @param {string} sound the specific sound the ear is listening for.
 * @param {string} reaction what to do once the event has been heard.
 * @param {string} self the instance that is listening/
 * @param {*=} backpack any parameters to carry with it to handle the reaction.
*/
jp.events.listen = function(ear, sound, reaction, self, backpack = null) {
  $(ear).bind(sound, jp.bind(reaction, self, backpack));
};

/*
 * Calls out an event, using anthropomorphic metaphors to descripe the talker.
 * @param {string} self the instance that is talking.
 * @param {string} voice the specific sound the voice is saying.
 
 * @param {*=} backpack any parameters to carry with it to handle the reaction.
*/
jp.events.talk = function(self, voice) {
  $(self).trigger(voice);
};


/*
 * The class to setup and load the engine
 * @constructor
 */
 jp.engine = function() {

  /*
 * Set the number of asset paths
 * @type {boolean}
 */
  this.assetPathsLoaded_ = 0;

  /*
 * Set the jsonData
 * @type {Object}
 */
  this.jsonData_ = {};

 /*
 * The layout type
 * @type {string}
 */
  this.layout_;

 /*
 * The layout type
 * @type {Object}
 */
  this.layoutContent_;
 };

/*
 * The startup function called from the index file
 * @public
*/
 jp.startup = function() {
  // Remove the startup script
  document.body.children[0].remove();
  jp.engineInstance = new jp.engine();
  jp.engineInstance.init();
};

/*
 * Restart the engine for debugging purposes
 * @public
*/
 jp.restart = function() {
  jp.engineInstance = null;
   jp.startup();
 };


/*
 * Initializer after libraries are loaded
*/
jp.engine.prototype.init = function() {
  var paths = this.getAssetPaths();
  // set the total number of asset paths
  this.totalAssetPaths_ = paths.length;
  this.loadJSON(paths, jp.bind(this.handleJSONLoad, this));
};


/*
 * Gets the asset paths
 * @return {Array} the asset paths.
*/
jp.engine.prototype.getAssetPaths = function() {
  // Get the set language
  var utility = new jp.utility(),
      language = utility.getUrlParams('lang') || 'en',
      courseId = utility.getUrlParams('id'),
      assetPaths;
  //The Asset paths to load
  assetPaths = [
  'assets/global/js/config.js',
  'assets/' + language + '/js/config.js',
  'assets/' + language + '/js/localization.js'
  ];

  if (courseId) {
    assetPaths.push(
    '../courses/' + courseId + '/assets/global/js/config.js',
    '../courses/' + courseId + '/assets/' + language + '/js/config.js',
    '../courses/' + courseId + '/assets/' + language + '/js/localization.js'
    );
  }

  return assetPaths;
};



/*
 * Verifies libraries
 * @return {Boolean} are all libraries available?
*/
jp.engine.prototype.verifyAPIs = function() {
  verified = true;
  for (i in this.libraryAPIs_) {
    if (!window[this.libraryAPIs_[i]]) {
      verified = false;
    }
  }
  return verified;
};


/*
 * Loads the json files one at a time to ensure the json data is cascaded by priority
 * @param {Array} paths we take the first path to load.
 * @param {Function} callback the callback function.
*/
jp.engine.prototype.loadJSON = function(paths, callback) {
  var path = paths[0], request;

  if (!path) {
    return;
  }
  // remove the path from the array
  paths.shift();
  // get the json file
  request = $.getJSON(path, function(data) {
    // run the callback with the data
    callback(data);
    // reload this function until there are no more paths
    this.loadJSON(paths, callback);
  }.bind(this)).fail(function(data, response) {
    // load failure handler
    jp.error(jp.errorCodes['jsonLoad'], path + ' ' + response);
    this.loadJSON(paths, callback);
    callback({});
  }.bind(this));
};


/*
 * Handles json paths loaded
 * @param {Object} data the json data.
*/
jp.engine.prototype.handleJSONLoad = function(data) {
  // Increment the number of paths loaded
  this.assetPathsLoaded_++;
  // Extend the jsonData object
  $.extend(this.jsonData_, data);
  // Determine if we have loaded all paths
  if (this.totalAssetPaths_ === this.assetPathsLoaded_) {
    this.activate();
  }
};


/*
 * The engine is now loaded and can start its real work
*/
jp.engine.prototype.activate = function() {
  document.title = new jp.utility().findJsonData(['course', 'title'], this.getJsonData());
  this.layout_ = new jp.layouts;
  this.style_ = new jp.layouts;
  this.modelName_ = 'player';
  this.loadStyles();
  this.loadLayouts();
  jp.events.listen(this.style_, jp.events.styleLoad, this.renderStyle, this);
  jp.events.listen(this.layout_, jp.events.layoutLoad, this.renderLayout, this);
  jp.events.listen(this.layout_, jp.events.elementRendered, this.setButtonEvents, this);
};


/*
 * Loads the layout for a specific model
*/
jp.engine.prototype.loadStyles = function() {
  this.style_.renderJsonStyles(this.modelName_, this.getJsonData());
  var  styles = this.style_.getStyles(),
      totalStyles = styles.length,
      i;

  
  // Load the layouts
  if (styles) {
    for (i = 0; i < totalStyles; i++) {
      this.style_.loadStyle(this.modelName_, 'assets/global/styles/' + styles[i] + '.css');
    }
  } else {
    jp.error(jp.errorCodes['styleMissingFromConfig']);
  }
};


/*
 * Loads the layout for a specific model
*/
jp.engine.prototype.loadLayouts = function() {
  this.layout_.renderJsonLayouts(this.modelName_, this.getJsonData());
  // Load the layouts
  if (this.layout_.getLayout()) {
    this.layout_.loadLayout(this.modelName_, 'assets/global/layouts/' + this.layout_.getLayout() + '.html');
  } else {
    jp.error(jp.errorCodes['layoutMissingFromConfig']);
  }
};


/*
 * Renders the layout
*/
jp.engine.prototype.renderLayout = function() {
  this.layout_.renderLayout(this.modelName_);
};


/*
 * Sets button events
*/
jp.engine.prototype.setButtonEvents = function() {
  var buttons = this.layout_.renderedElement_.getElementsByClassName('button'),
      totalButtons = buttons.length,
      button,
      i;

  for (i = 0; i < totalButtons; i++) {
    button = buttons[i];
    this.onClickEvent(button);
  }

  this.layout_.renderDom();
};

/*
 * Handles event for an element
*/
jp.engine.prototype.onClickEvent = function(element) {
  var callback;

  switch (element.id) {
    case 'reboot':
      callback = jp.restart;
      break;
    case 'menu':
      callback = jp.restart;
      break;
    default:
      return;
  }

  $(element).bind('click', (function(evt) {
    callback();
  }));
};


/*
 * Renders the dom
*/
jp.engine.prototype.renderDom = function() {
  this.layout_.renderDom();
};


/*
 * Loads the style
*/
jp.engine.prototype.loadStyle = function() {
  this.style_.loadStyle(this.modelName_);
};


/*
 * Renders the style
*/
jp.engine.prototype.renderStyle = function() {
  this.style_.renderStyle(this.modelName_);
};


/*
 * Gets the jsondata
 * @return {string} the layout name.
*/
jp.engine.prototype.getJsonData = function() {
  return this.jsonData_;
};


/*
 * The UI class
*/
jp.ui = function() {};


/*
 * Sets the innerHTML of an element
 * @param {string} id the element id.
 * @param {string} innerHTML the innerHtml to set.
*/
jp.ui.prototype.setHtmlById = function(id, innerHTML) {
  $('#' + id).html(innerHTML);
};


/*
 * Creates an element
 * @param {string} type the element type.
 * @param {string=} id the element id.
 * @param {string=} className the element class.
 * @param {string=} innerHTML the innerHtml to set.
 * @return {Element} the element created
*/
jp.ui.prototype.createElement = function(type, id, className, innerHTML) {
  return jQuery('<' +type + '>', {
    'id': id,
    'text': innerHTML,
    'class': className
  });
}


/*
 * The Layouts class
*/
jp.layouts = function() {

 /*
  * The layout name
  * @type {string}
 */
  this.layout_;

 /*
  * The layout content
  * @type {string}
 */
  this.layoutContent_;
};



/*
 * Sets the layout
 * @param {string} layout the layout name.
*/
jp.layouts.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};


/*
 * Gets the layout
 * @return {string} the layout name.
*/
jp.layouts.prototype.getLayout = function() {
  return this.layout_;
};

/*
 * Sets the layout content
 * @param {string} layoutContent the layout name.
*/
jp.layouts.prototype.setLayoutContent = function(layoutContent) {
  this.layoutContent_ = layoutContent;
};


/*
 * Gets the layout content
 * @return {string} the layout name.
*/
jp.layouts.prototype.getLayoutContent = function() {
  return this.layoutContent_;
};


/*
 * Sets the style
 * @param {string|Array} style the style name.
*/
jp.layouts.prototype.setStyle = function(style) {
  this.style_ = style;
};


/*
 * Gets the style
 * @return {string|Array} the style name.
*/
jp.layouts.prototype.getStyles = function() {
  return this.style_;
};

/*
 * Sets the style content
 * @param {string} styleContent the style name.
*/
jp.layouts.prototype.setStyleContent = function(styleContent) {
  this.styleContent_ = styleContent;
};


/*
 * Gets the style content
 * @return {string} the style name.
*/
jp.layouts.prototype.getStyleContent = function() {
  return this.styleContent_;
};

/*
 * Set the layouts defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.layouts.prototype.renderJsonLayouts = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      layout = util.findJsonData([jsonTitle, 'layout'], jsonData);
      layoutContent = util.findJsonData([jsonTitle, 'layoutContent'], jsonData);

  this.setLayout(layout);
  this.setLayoutContent(layoutContent);
};


/*
 * Set the layouts defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.layouts.prototype.renderJsonStyles = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      style = util.findJsonData([jsonTitle, 'style'], jsonData);
      styleContent = util.findJsonData([jsonTitle, 'styleContent'], jsonData);

  this.setStyle(style);
  this.setStyleContent(styleContent);
};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.layouts.prototype.loadLayout = function(name, path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        jp.events.talk(this, jp.events.layoutLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['layoutMissing']);
  });
}


/*
 * Renders a dust layout and stores the element
 * @param {string} name the layout name.
*/
jp.layouts.prototype.renderLayout = function(name) {
  var data = jp.engineInstance.getJsonData(),
      layoutContent = this.getLayoutContent(),
      jsonData = data[layoutContent],
      element;

    callback = function(error, html) {
      if (error) {
        jp.error(jp.errorCodes['dustError'], error);
        return;
      }
      element = this.convertLayoutToNode(html);
      if (element) {
        this.renderedElement_ = element;
        jp.events.talk(this, jp.events.elementRendered);
      }
    }.bind(this);

  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup']);
  } else {
    dust.render(name, jsonData, callback);
  }
};


/*
 * Renders the created element to the dom
 * @param {string} name the layout name.
*/
jp.layouts.prototype.renderDom = function() {
  $('body').append(this.renderedElement_);
};


/*
 * Converts a dust string into a node.
 * @param {string} htmlString the html in string format.
 * @return {Node} the node created.
*/
jp.layouts.prototype.convertLayoutToNode = function(htmlString) {
  var div = document.createElement('div'),
      node;

  div.innerHTML = "<br>" + htmlString;
  div.removeChild(div.firstChild)

  if (div.childNodes.length == 1) {
    return div.removeChild(div.firstChild)
  } else {
    element = document.createDocumentFragment();
    while (div.firstChild) {
      element.appendChild(div.firstChild)
    }
    return element
  }
};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.layouts.prototype.loadStyle = function(name, path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        jp.events.talk(this, jp.events.styleLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['styleMissing']);
  });
}


/*
 * Renders a dust layout to the dom
 * @param {string} name the layout name.
 * @param {Element} parent the parent element to load the template into.
*/
jp.layouts.prototype.renderStyle = function(name, parent) {
  var data = jp.engineInstance.getJsonData(),
      styleContent = this.getStyleContent(),
      jsonData = data[styleContent],
      callback = function(error, info) {
        if (error) {
          jp.error(jp.errorCodes['dustError'], error);
          return;
        }
        this.addCssText(info);
    }.bind(this);
  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup'], name);
  } else {
    dust.render(name, jsonData, callback);
  }
};


/**
 * Writes a CSS node used to add a style to.
 * @return {Element} The cssNode to embed the styles to.
 */
jp.layouts.prototype.getCssNode = function() {
  if (this.cssNode_) {
    return this.cssNode_;
  }

  var cssNode = document.createElement('style'),
      head = document.getElementsByTagName('head')[0];

  cssNode.type = 'text/css';
  head.appendChild(cssNode);
  this.cssNode_ = cssNode;
  mynode = this.cssNode_;
  return this.cssNode_;
};



/**
 * Adds CSS text to the dom's <head>
 * @param {string} cssText CSS to add to the end of the document.
 */
jp.layouts.prototype.addCssText = function(cssText) {
  var cssNode = this.getCssNode(),
      cssTextNode = document.createTextNode(cssText);

  if (cssNode.styleSheet) {
    // IE implementation
    cssNode.styleSheet.cssText += cssText;
  } else {
    // Most browsers
    cssNode.appendChild(cssTextNode);
  }
  jp.events.talk(this, jp.events.styleLoaded);
};
