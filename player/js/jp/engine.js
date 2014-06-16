
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
  this.template_;

 /*
 * Set the utility
 * @type {Object}
 */
  this.utility_ = new jp.utility();
 };

/*
 * The startup function called from the index file
 * @public
*/
 jp.startup = function() {
  // Remove the startup script
  jp.engineInstance = new jp.engine();
  jp.engineInstance.init();
};

/*
 * Restart the engine for debugging purposes
 * @public
*/
 jp.restart = function() {
  var bodyChild = document.body.children[0];
  jp.ui.removeElement(bodyChild);
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
  this.title_ = this.getConfig(['course', 'title']);
  document.title = this.title_;
  // Create the player
  this.player_ = new jp.player('player', this.getJsonData());
  // Set the player title
  this.player_.setTitle(this.title_);
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.engine.prototype.getJsonData = function() {
  return this.jsonData_;
};


/*
 * Gets the jsondata
 * @param {Array} data the data to look for.
 * @return {*} the data or null.
*/
jp.engine.prototype.getConfig = function(data) {
  return this.utility_.findJsonData(data, this.getJsonData());
};
