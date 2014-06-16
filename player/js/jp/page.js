
/*
 * The page class
 * @param {string} the current model name.
 * @param {Object} the content. 
*/
jp.page = function(modelName, content) {

  /*
 * Set the utility
 * @type {Object}
 */
  this.utility_ = new jp.utility();

  // Set the model name
  this.modelName_ = modelName;

  // Set the model to the current model name
  this.model_ = content[modelName];

  // Set the model to the current model name
  this.contextName_ = this.model_['modelContext'];

  this.modelContext_ = this.getConfig([this.contextName_], content);

  // The model's title
  this.title_;

  // Create a template instance
  this.template_ = new jp.template;

  // Load styles and layouts
  this.loadStyles();
  this.loadLayouts();

  // Add event listeners
  jp.events.listen(this.template_, jp.events.styleLoad, this.renderStyle, this);
  jp.events.listen(this.template_, jp.events.layoutLoad, this.renderLayout, this);
  jp.events.listen(this.template_, jp.events.elementRendered, this.activate, this);
};


/*
 * Loads the layout for a specific model
*/
jp.page.prototype.loadStyles = function() {
  this.template_.renderJsonStyles(this.modelName_, this.getModel());
  var  styles = this.template_.getStyles(),
      totalStyles = styles.length,
      i;

  
  // Load the layouts
  if (styles) {
    for (i = 0; i < totalStyles; i++) {
      this.template_.loadStyle(this.modelName_, 'assets/global/styles/' + styles[i] + '.css');
    }
  } else {
    jp.error(jp.errorCodes['styleMissingFromConfig']);
  }
};


/*
 * Loads the layout for a specific model
*/
jp.page.prototype.loadLayouts = function() {
  this.template_.renderJsonLayouts(this.modelName_, this.getModel());
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
  this.setButtonMap();
  this.setButtonEvents();
  this.template_.renderDom();
  this.setHtml();
}

/*
 * Sets button events
*/
jp.page.prototype.setButtonEvents = function() {
  var buttons = document.getElementsByClassName('button'),
      totalButtons = buttons.length,
      button,
      i;

  for (i = 0; i < totalButtons; i++) {
    button = buttons[i];
    this.matchButtonEvents(button);
  }
};


/*
 * Sets all html text
*/
jp.page.prototype.setHtml = function() {
  jp.ui.setHtmlById('title', this.title_);
};


/*
 * Sets the button maps
*/
jp.page.prototype.setButtonMap = function() {  
  this.buttonMap_ = this.modelContext_['buttonMap'];
}

/*
 * Gets the button maps
*/
jp.page.prototype.getButtonMap = function() {
  return this.buttonMap_;
}


/*
 * Handles event for an element
*/
jp.page.prototype.matchButtonEvents = function(element) {
  var callbackString,
      callbackFunction,
      buttonMaps = this.getButtonMap(),
      totalbuttonMaps = buttonMaps.length,
      buttonMap,
      i;

  for (i = 0; i < totalbuttonMaps; i++) {
    buttonMap = buttonMaps[i];
    if (buttonMap['id'] === element.id) {
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
 * @param {Array} data the data to look for.
 * @return {*} the data or null.
*/
jp.page.prototype.getConfig = function(data, content) {
  dataModel = content || this.getModel();
  return this.utility_.findJsonData(data, dataModel);
};