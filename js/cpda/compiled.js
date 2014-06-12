
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
  'js/lib/min/angular-min.js',
  'js/lib/min/modernizr-min.js',
  'js/lib/min/jquery-1.11.1-min.js'
  ];
} else {
  jp.libraries = [
  'js/lib/angular.js',
  'js/lib/modernizr.js',
  'js/lib/jquery-1.11.1.js'
  ];
};


/*
 * The Asset paths to load
 */
jp.assetPaths = [
  'assets/global/js/config.js',
  'assets/en/js/localization.js',
  'assets/he/js/localization.js',
  'assets/global/layouts/chapter.js'
];


/*
 * The Error objects wih a code and detail
 */
jp.ErrorCodes = {
  'libraryLoad': {'code': 'loader-001', 'detail': 'Error loading libraries'},
  'jsonLoad': {'code': 'loader-002', 'detail': 'Error loading json files'}
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
  // set the total number of asset paths
  jp.totalAssetPaths = jp.assetPaths.length;
  // Verify the apis are set and then load the json files
  if (jp.verifyAPIs()) {
    jp.loadJSON(jp.handleJSONLoad);
  } else {
    jp.error(jp.ErrorCodes['libraryLoad']);
  }
};


/*
 * Verifies libraries
 * @return {Boolean} are all libraries available?
*/
jp.verifyAPIs = function() {
  return !(!window['angular'] || !window['Modernizr'] || !window['jQuery']);
};


/*
 * Loads the json files one at a time to ensure the json data is cascaded by priority
 * @param {Function} callback the callback function.
*/
jp.loadJSON = function(callback) {
  var path = jp.assetPaths[0];

  if (!path) {
    return;
  }
  // remove the path from the array
  jp.assetPaths.shift();
  // get the json file
  $.getJSON(path, function(data) {
    // run the callback with the data
    callback(data);
    // reload this function until there are no more paths
    jp.loadJSON(callback);
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
  $.extend(jp.jsonData, data)
  // Determine if we have loaded all paths
  if (jp.totalAssetPaths === jp.assetPathsLoaded) {
    jp.welcome();
  }
};


/*
 * Welcome message as the course loads
*/
jp.welcome = function() {
  var div,
      html = jp.jsonData['loader']['html'],
      className = jp.jsonData['loader']['class'],
      id = jp.jsonData['loader']['id'],

  div = jp.ui.createElement('div', id, html);
  $(div).addClass(className);
  $('body').append(div);
};


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
 * @param {string} innerHTML the innerHtml to set.
 * @return {Element} the element created
*/
jp.ui.createElement = function(type, id, innerHTML) {
  return jQuery('<' +type + '>', {
    id: id,
    text: innerHTML
  });
}





