
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
jp.bindJs_ = function(fn, selfObj, var_args) {
  var context = selfObj || jp.global;
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
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
jp.bindNative_ = function(fn, selfObj, var_args) {
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
    jp.bind = jp.bindNative_;
  } else {
    jp.bind = jp.bindJs_;
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
  'styleMissingFromConfig': {'code': 'css-001', 'detail': 'Styles missing'},
};


jp.events = {
  layoutLoad: 'layoutLoad',
  styleLoad: 'styleLoad',
  styleLoaded: 'styleLoaded'
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
 * The Required libraries dependent on production mode
 */
  if (jp.PRODUCTION) {
    this.libraries_ = [
    'js/lib/min/modernizr.min.js',
    'js/lib/min/jquery-1.11.1-min.js',
    'js/lib/min/dust-full-0.3.0.min.js'
    ];
  } else {
    this.libraries_ = [
    'js/lib/modernizr.js',
    'js/lib/jquery-1.11.1.js',
    'js/lib/dust-full-0.3.0.js'
    ];
  }

  /*
 * The APIs to verify
 */
  this.libraryAPIs_ = ['Modernizr', 'jQuery', 'dust'];


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
  jp.engine = new jp.engine();
  jp.engine.load(jp.bind(jp.engine.init, jp.engine));
};

/*
 * Loads libraries using yepNope
*/
jp.engine.prototype.load = function(callback) {
  yepnope({
    load: this.libraries_,
    complete: function() {
      callback();
    }
  });
};


/*
 * Initializer after libraries are loaded
*/
jp.engine.prototype.init = function() {
  var paths = this.getAssetPaths();
  // set the total number of asset paths
  this.totalAssetPaths_ = paths.length;
  // Verify the apis are set and then load the json files
  if (this.verifyAPIs()) {
    this.loadJSON(paths, jp.bind(this.handleJSONLoad, this));
  } else {
    jp.error(jp.errorCodes['libraryLoad']);
  }
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
  this.loadStyles('player');
};


/*
 * Loads the layout for a specific model
 * @param {string} modelName the json key.
*/
jp.engine.prototype.loadLayouts = function(modelName) {
  var layout = new jp.layouts, eventHandler;

  eventHandler = function(evt) {
    layout.renderLayout(modelName, 'body');
  }.bind(this);

  layout.renderJsonLayouts(modelName, this.getJsonData());
  // Load the layouts
  if (layout.getLayout()) {
    $(layout).bind(jp.events.layoutLoad, eventHandler);
    layout.loadLayout(modelName, 'assets/global/layouts/' + layout.getLayout() + '.html');
  } else {
    jp.error(jp.errorCodes['layoutMissingFromConfig']);
  }
};


/*
 * Loads the layout for a specific model
 * @param {string} modelName the json key.
*/
jp.engine.prototype.loadStyles = function(modelName) {
  var layout = new jp.layouts, eventHandler;

  renderStyle = function(evt) {
    layout.renderStyle(modelName, 'body');
  }.bind(this);

  loadLayouts = function(evt) {
    this.loadLayouts(modelName);
  }.bind(this);


  layout.renderJsonStyles(modelName, this.getJsonData());
  // Load the layouts
  if (layout.getStyle()) {
    $(layout).bind(jp.events.styleLoad, renderStyle);
    $(layout).bind(jp.events.styleLoaded, loadLayouts);
    layout.loadStyle(modelName, 'assets/global/styles/' + layout.getStyle() + '.css');
  } else {
    jp.error(jp.errorCodes['styleMissingFromConfig']);
  }
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
 * @param {string} style the style name.
*/
jp.layouts.prototype.setStyle = function(style) {
  this.style_ = style;
};


/*
 * Gets the style
 * @return {string} the style name.
*/
jp.layouts.prototype.getStyle = function() {
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
        $(this).trigger(jp.events.layoutLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['layoutMissing']);
  });
}


/*
 * Renders a dust layout to the dom
 * @param {string} name the layout name.
 * @param {Element} parent the parent element to load the template into.
*/
jp.layouts.prototype.renderLayout = function(name, parent) {
  var data = jp.engine.getJsonData(),
      layoutContent = this.getLayoutContent(),
      jsonData = data[layoutContent],
      callback = function(error, info) {
        if (error) {
          jp.error(jp.errorCodes['dustError'], error);
          return;
        }
      $(parent).append(info);
    };
  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup']);
  } else {
    dust.render(name, jsonData, callback);
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
        $(this).trigger(jp.events.styleLoad);
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
  var data = jp.engine.getJsonData(),
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
    jp.error(jp.errorCodes['dustMarkup']);
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
  $(this).trigger(jp.events.styleLoaded);
};