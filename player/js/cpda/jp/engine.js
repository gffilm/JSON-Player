
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
