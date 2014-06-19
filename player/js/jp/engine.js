
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
  jp.events.talk(jp.engineInstance, jp.events.reboot);
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
  'assets/global/js/dustContext.js',
  'assets/' + language + '/js/config.js',
  'assets/' + language + '/js/localization.js'
  ];

  if (courseId) {
    assetPaths.push(
    '../courses/' + courseId + '/assets/global/js/config.js',
    '../courses/' + courseId + '/assets/global/js/dustContext.js',
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
    callback(path, data);
    // reload this function until there are no more paths
    this.loadJSON(paths, callback);
  }.bind(this)).fail(function(data, response) {
    // load failure handler
    jp.error(jp.errorCodes['jsonLoad'], path + ' ' + response);
    this.loadJSON(paths, callback);
    callback(path, {});
  }.bind(this));
};


/*
 * Handles json paths loaded
 * @param {string} path the path the data came from.
 * @param {Object} data the json data.
*/
jp.engine.prototype.handleJSONLoad = function(path, data) {
  var fileType = path.split('/')[path.split('/').length -1].split('.')[0],
      extended = false;
  // Increment the number of paths loaded
  this.assetPathsLoaded_++;

  // Extend the jsonData object with the filetype
  if (!this.jsonData_[fileType]) {
    this.jsonData_[fileType] = data;
  } else {
    for (i in data) {
      if (this.jsonData_[fileType][i]) {
        $.extend(this.jsonData_[fileType][i], data[i]);
      } else {
        this.jsonData_[fileType][i] = data[i];
      }
      extended = true;
    }
    if (!extended) {
      $.extend(this.jsonData_[fileType], data);
    }
  }
  
  // Determine if we have loaded all paths
  if (this.totalAssetPaths_ === this.assetPathsLoaded_) {
    this.createPlayer();
  }
};


/*
 * The engine is now loaded, start the player
*/
jp.engine.prototype.createPlayer = function() {
  this.title_ = this.findDataByType(['course', 'title'], 'localization');
  document.title = this.title_;
  // Create the player
  this.player_ = new jp.player('player', this.getConfig());
  jp.events.listen(this.player_, jp.events.readyToActivate, this.startPlayer, this);
};


/*
 * Start the player
*/
jp.engine.prototype.startPlayer = function() {
  this.player_.activate();
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
  return this.getJsonData()['config'];
};


/*
 * Finds specific jsondata
 * @param {Array} data the data to look for.
 * @param {string} type the type to look for.
 * @return {*} the data or null.
*/
jp.engine.prototype.findDataByType = function(data, type) {
  return this.utility_.findJsonData(data, this.getJsonData()[type]);
};
