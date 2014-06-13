
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
 * Logs an error
 * @param {jp.ErrorCodes} error the error object.
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
jp.ErrorCodes = {
  'libraryLoad': {'code': 'loader-001', 'detail': 'Error loading libraries'},
  'jsonLoad': {'code': 'loader-002', 'detail': 'Error loading json files'},
  'dustError': {'code': 'dust-001', 'detail': 'Error parsing dust file'},
  'dustMarkup': {'code': 'dust-002', 'detail': 'Dust markup missing'},
  'layoutMissing': {'code': 'dust-003', 'detail': 'Dust layout missing'},
  'layoutMissingFromConfig': {'code': 'dust-004', 'detail': 'Dust layout missing from config'},
  'layoutContentMissing': {'code': 'dust-005', 'detail': 'Dust layout content missing'}
};


jp.events = {
  layoutLoad: 'layoutLoad'
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
  jp.engine.load();
};

/*
 * Loads libraries using yepNope
*/
jp.engine.prototype.load = function() {
  yepnope({
    load: this.libraries_,
    complete: function() {
      this.init();
    }.bind(this)
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
    jp.error(jp.ErrorCodes['libraryLoad']);
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
    jp.error(jp.ErrorCodes['jsonLoad'], path + ' ' + response);
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


jp.engine.prototype.activate = function() {
  var layout = new jp.layouts, eventHandler;

  eventHandler = function(evt) {
    layout.render('myLayout', 'body');
  }.bind(this);

  this.welcome();
  // Load the layouts
  if (this.getLayout()) {
    $(layout).bind(jp.events.layoutLoad, eventHandler);
    layout.load('assets/global/layouts/' + this.getLayout() + '.html');
  } else {
    jp.error(jp.ErrorCodes['layoutMissingFromConfig']);
  }
};


/*
 * Sets the layout
 * @param {string} layout the layout name.
*/
jp.engine.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};


/*
 * Gets the layout
 * @return {string} the layout name.
*/
jp.engine.prototype.getLayout = function() {
  return this.layout_;
};


/*
 * Gets the jsondata
 * @return {string} the layout name.
*/
jp.engine.prototype.getJsonData = function() {
  return this.jsonData_;
};


/*
 * Sets the layout content
 * @param {string} layoutContent the layout name.
*/
jp.engine.prototype.setLayoutContent = function(layoutContent) {
  this.layoutContent_ = layoutContent;
};


/*
 * Gets the layout content
 * @return {string} the layout name.
*/
jp.engine.prototype.getLayoutContent = function() {
  return this.layoutContent_;
};


/*
 * Welcome message as the course loads
*/
jp.engine.prototype.welcome = function() {
  var div,
      util = new jp.utility(),
      jsonData = this.getJsonData();
      title = util.findJsonData(['course', 'title'], jsonData),
      className = util.findJsonData(['loader', 'class'], jsonData),
      id = util.findJsonData(['loader', 'id'], jsonData),
      layout = util.findJsonData(['loader', 'layout'], jsonData);
      layoutContent = util.findJsonData(['loader', 'layoutContent'], jsonData);

  this.setLayout(layout);
  this.setLayoutContent(layoutContent);
  div = new jp.ui().createElement('div', id, className);
  $('body').append(div);
  document.title = title;
  jp.welcomeDiv = div;
};


/*
 * Welcome message as the course loads
*/
jp.engine.prototype.removeWelcome = function() {
  if (jp.welcomeDiv) {
    jp.welcomeDiv.remove();
  }
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
 * The Layouts class
*/
jp.layouts = function() {};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} path the uri of the layout to load.
*/
jp.layouts.prototype.load = function(path) {
  var compiled,
      name = 'myLayout',
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        $(this).trigger(jp.events.layoutLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.ErrorCodes['layoutMissing']);
  });
}


/*
 * Renders a dust layout to the dom
 * @param {string} name the layout name.
 * @param {Element} parent the parent element to load the template into.
*/
jp.layouts.prototype.render = function(name, parent) {
  var data = jp.engine.getJsonData(),
      layoutContent = jp.engine.getLayoutContent(),
      jsonData = data[layoutContent],
      callback = function(error, info) {
        if (error) {
          jp.error(jp.ErrorCodes['dustError'], error);
          return;
        }
      $(parent).append(info);
    };
  if (!jsonData) {
    jp.error(jp.ErrorCodes['dustMarkup']);
  } else {
    dust.render(name, jsonData, callback);
  }
};
