
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
 * Set the number of asset paths
 * @type {boolean}
 */
jp.assetPathsLoaded = 0;


/*
 * Set the jsonData
 * @type {Object}
 */
jp.jsonData = [];


/*
 * The Required libraries dependent on production mode
 */
if (jp.PRODUCTION) {
  jp.libraries = [
  'js/lib/min/modernizr-min.js',
  'js/lib/min/jquery-1.11.1-min.js',
  'js/lib/dust-full-0.6.0.js'
  ];
} else {
  jp.libraries = [
  'js/lib/modernizr.js',
  'js/lib/jquery-1.11.1.js',
  'js/lib/dust-full-0.6.0.js'
  ];
};

/*
 * The APIs to be loaded
 */
jp.libraryAPIs = ['Modernizr', 'jQuery', 'dust'];


/*
 * The Error objects wih a code and detail
 */
jp.ErrorCodes = {
  'libraryLoad': {'code': 'loader-001', 'detail': 'Error loading libraries'},
  'jsonLoad': {'code': 'loader-002', 'detail': 'Error loading json files'},
  'dustError': {'code': 'dust-001', 'detail': 'Error parsing dust file'}
}


/*
 * Avoids errors if there is not a console
*/
if (!window.console) {
  console = {};
  console.log = function() {};
}


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
 * Loads libraries using yepNope
*/
jp.load = function() {
  yepnope({
    load: jp.libraries,
    complete: function() {
      jp.init();
    }
  });
};


/*
 * Initializer after libraries are loaded
*/
jp.init = function() {
  var paths = jp.getAssetPaths();
  // set the total number of asset paths
  jp.totalAssetPaths = paths.length;
  // Verify the apis are set and then load the json files
  if (jp.verifyAPIs()) {
    jp.loadJSON(paths, jp.handleJSONLoad);
  } else {
    jp.error(jp.ErrorCodes['libraryLoad']);
  }
};


/*
 * Gets the asset paths
 * @return {Array} the asset paths.
*/
jp.getAssetPaths = function() {
  // Get the set language
  var language = jp.utility.getUrlParams('lang') || 'en',
      courseId = jp.utility.getUrlParams('id'),
      assetPaths;
  //The Asset paths to load
  assetPaths = [
  'assets/global/js/config.js',
  'assets/' + language + '/js/localization.js'
  ];

  if (courseId) {
    assetPaths.push(
    '../courses/' + courseId + '/assets/global/js/config.js',
    '../courses/' + courseId + '/assets/' + language + '/js/localization.js'
    );
  }

  return assetPaths;
};



/*
 * Verifies libraries
 * @return {Boolean} are all libraries available?
*/
jp.verifyAPIs = function() {
  verified = true;
  for (i in jp.libraryAPIs) {
    if (!window[jp.libraryAPIs[i]]) {
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
jp.loadJSON = function(paths, callback) {
  var path = paths[0];

  if (!path) {
    return;
  }
  // remove the path from the array
  paths.shift();
  // get the json file
  $.getJSON(path, function(data) {
    // run the callback with the data
    callback(data);
    // reload this function until there are no more paths
    jp.loadJSON(paths, callback);
  }).fail(function(data, response) {
    jp.error(jp.ErrorCodes['jsonLoad'], path + ' ' + response);
  });
};


/*
 * Handles json paths loaded
 * @param {Object} data the json data.
*/
jp.handleJSONLoad = function(data) {
  // Increment the number of paths loaded
  jp.assetPathsLoaded++;
  // Extend the jsonData object
  $.extend(jp.jsonData, data);
  // Determine if we have loaded all paths
  if (jp.totalAssetPaths === jp.assetPathsLoaded) {
    jp.activate();
  }
};


jp.activate = function() {
  jp.welcome();
  // Load the layouts
  jp.layouts.load('assets/global/layouts/chapter.html');
};


/*
 * Welcome message as the course loads
*/
jp.welcome = function() {
  var div,
      html = jp.utility.getJsonData(['loader', 'html'], jp.jsonData) || 'Loading...',
      className = jp.utility.getJsonData(['loader', 'class'], jp.jsonData) || 'loader',
      id = jp.utility.getJsonData(['loader', 'id'], jp.jsonData) || 'loader',
      title = jp.utility.getJsonData(['course', 'title'], jp.jsonData) || 'Course Title';

  div = jp.ui.createElement('div', id, className, html);
  $('body').append(div);
  document.title = title;
  jp.welcomeDiv = div;
};


/*
 * Welcome message as the course loads
*/
jp.removeWelcome = function() {
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
jp.ui.setHtmlById = function(id, innerHTML) {
  $('#' + id).html(innerHTML);
};


/*
 * Creates an element
 * @param {string} type the element type.
 * @param {string} id the element id.
 * @param {string} className the element class.
 * @param {string} innerHTML the innerHtml to set.
 * @return {Element} the element created
*/
jp.ui.createElement = function(type, id, className, innerHTML) {
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
jp.utility.getUrlParams = function(param) {
  return decodeURIComponent(
    (new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) ||
      [,""])[1].replace(/\+/g, '%20')) || null;

};

/*
 * Gets json data.
 * @param {Array} needles the data to look for.
 * @param {Object} haystack the data to search through.
 * @return {*} the data or null.
*/
jp.utility.getJsonData = function(needles, haystack) {
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
jp.layouts = {};


/*
 * Gets a layout based on a path and renders it once loaded.
 * @param {string} path the uri of the layout to load.
 * @param {Element=} optParent the optional parent element to load the template into.
*/
jp.layouts.load = function(path, optParent) {
  var compiled,
      name = 'myLayout',
      callback = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        jp.layouts.render(name, optParent);
      };
  optParent = optParent || 'body';
  $.get(path, callback);
}


/*
 * Renders a layout
 * @param {string} data the layout data.
 * @param {Element} parent the parent element to load the template into.
*/
jp.layouts.render = function(name, parent) {
  var callback = function(error, info) {
    if (error) {
      jp.error(jp.ErrorCodes['dustError'], error);
      return;
    }
    jp.removeWelcome();
    $(parent).append(info);
  };
  dust.render(name, {}, callback);
};