
/*
 * The page class
 * @param {string} the current model name.
 * @param {Object} data the data. 
*/
jp.page = function(modelName, data) {

  /*
 * Set the utility
 * @type {Object}
 */
  this.utility_ = new jp.utility();

 /*
 * Set the data
 * @type {Object}
 */
  this.data_ = data;

  // Set the model name
  this.modelName_ = modelName;

  // Set the model to the current model name
  this.model_ = data[modelName];

  // Set the model to the current model name
  this.contextName_ = this.model_['modelContext'];

  this.modelContext_ = this.findData([this.contextName_]);

  this.buttonMap_ = this.modelContext_['buttonMap'];

  // The model's title
  this.title_;

  // Create a template instance
  this.template_ = new jp.template(data);

  // Set and load styles and layouts
  this.setStyles();
  this.setLayouts();
  this.loadStyles();

  // Add event listeners
  jp.events.listen(this.template_, jp.events.allStylesLoaded, this.loadLayouts, this);
  jp.events.listen(this.template_, jp.events.layoutLoad, this.renderLayout, this);
  jp.events.listen(this.template_, jp.events.elementRendered, this.activate, this);
};


/*
 * Sets the styles for the template to render
*/
jp.page.prototype.setStyles = function() {
  this.template_.setStyles(this.modelName_, this.getModel());
};


/*
 * Sets the styles for the template to render
*/
jp.page.prototype.setLayouts = function() {
  this.template_.setLayouts(this.modelName_, this.getModel());
};


/*
 * Loads the layout for a specific model
*/
jp.page.prototype.loadStyles = function() {
  this.template_.setStyles(this.modelName_, this.getModel());
  var styles = this.template_.getStyles(),
      totalStyles = styles.length,
      i;

  
  // Load the layouts
  if (styles) {
    for (i = 0; i < totalStyles; i++) {
      // Add highest priority first
      this.template_.addStyle(this.modelName_, '../courses/45666/assets/global/styles/' + styles[i] + '.css');
      this.template_.addStyle(this.modelName_, 'assets/global/styles/' + styles[i] + '.css');
    }
    this.template_.loadNextStyle();
  } else {
    jp.error(jp.errorCodes['styleMissingFromConfig']);
  }
};


/*
 * Loads the layout for a specific model
*/
jp.page.prototype.loadLayouts = function() {
  // Load the layouts
  if (this.template_.getLayout()) {
    this.template_.loadLayout(this.modelName_, 'assets/global/layouts/' + this.template_.getLayout() + '.html');
  } else {
    jp.error(jp.errorCodes['layoutMissingFromConfig']);
  }
};


/*
 * Renders the layout
*/
jp.page.prototype.renderLayout = function() {
  this.template_.renderLayout(this.modelName_);
};


jp.page.prototype.activate = function() {
  this.template_.renderDom();
  this.matchButtonEvents();
  this.setHtml();
}


/*
 * Sets all html text
*/
jp.page.prototype.setHtml = function() {
  jp.ui.setHtmlById('title', this.title_);
};


/*
 * Gets the button maps
*/
jp.page.prototype.getButtonMap = function() {
  return this.buttonMap_;
}


/*
 * Handles event for an element
*/
jp.page.prototype.matchButtonEvents = function() {
  var callbackString,
      callbackFunction,
      buttonMaps = this.getButtonMap(),
      totalbuttonMaps = buttonMaps.length,
      buttonMap,
      i;

  for (i = 0; i < totalbuttonMaps; i++) {
    buttonMap = buttonMaps[i];
    element =  document.getElementById(buttonMap['id']);
    if (element) {
      callbackString = buttonMap['function'];
      if (callbackString) {
        // tie the function to this instance, then try the jp instance
        callbackFunction = this[callbackString] || jp[callbackString];
        if (callbackFunction) {
          this.addOnClickEvent(element, callbackFunction);
        }
      }
    }
  }
};


/*
 * Handles event for an element
*/
jp.page.prototype.test = function(evt, thisPage) {
  console.log(evt, thisPage);
};


/*
 * Handles event for an element
*/
jp.page.prototype.addOnClickEvent = function(element, callback) {
  var thisPage = this;

  $(element).bind('click', (function(evt) {
    callback(evt, thisPage);
  }));

  $(element).bind('keypress', (function(evt) {
    if (evt.charCode === 32 || evt.key === 'Enter') {
      callback(evt, thisPage);
    }
  }));
};


/*
 * Renders the dom
*/
jp.page.prototype.renderDom = function() {
  this.template_.renderDom();
};


/*
 * Loads the style
*/
jp.page.prototype.loadStyle = function() {
  this.template_.loadStyle(this.modelName_);
};


/*
 * Renders the style
*/
jp.page.prototype.renderStyle = function() {
  this.template_.renderStyle(this.modelName_);
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.page.prototype.getModel = function() {
  return this.model_;
};


/*
 * Sets the title
 * @return {Object} the data object.
*/
jp.page.prototype.setTitle = function(title) {
  this.title_ = title;
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.page.prototype.getData = function() {
  return this.data_;
};

/*
 * Finds specific jsondata
 * @param {Array} data the data to look for.
 * @param {string} type the type to look for.
 * @return {*} the data or null.
*/
jp.page.prototype.findData = function(data) {
  return this.utility_.findJsonData(data, this.getData());
};
