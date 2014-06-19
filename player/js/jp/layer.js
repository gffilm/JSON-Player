
/*
 * The layer class
 * @param {string} the current model name.
 * @param {Object} data the data. 
*/
jp.layer = function(modelName, data) {

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

  // The parent element for this node
  this.parentElement_;

  // The child element for this node
  this.childElement_;

  // Set the model to the current model name
  this.contextName_ = this.model_['modelContext'];

  this.modelContext_ = this.findData([this.contextName_]);

  this.buttonMap_ = this.modelContext_['buttonMap'];

  // The model's title
  this.title_;

  // The model's parent
  this.parent_;

  // The model's state
  this.isReady_= false;

  // The model's active state
  this.isActivated_ = false;

  // The model's children
  this.children_ = [];

  // Create a template instance
  this.template_ = new jp.template(data);

  // Set and load styles and layouts
  this.setStyles();
  this.setLayouts();
  this.loadStyles();

  // Add event listeners
  jp.events.listen(this.template_, jp.events.allStylesLoaded, this.loadLayouts, this);
  jp.events.listen(this.template_, jp.events.layoutLoad, this.renderLayout, this);
  jp.events.listen(this.template_, jp.events.elementRendered, this.getReadyToActivate, this);
};


/*
 * Sets the styles for the template to render
*/
jp.layer.prototype.setStyles = function() {
  this.template_.setStyles(this.modelName_, this.getModel());
};


/*
 * Sets the ready state
 *@param {boolean} ready Sets the ready state
*/
jp.layer.prototype.setReady = function(ready) {
  this.isReady_ = ready;
};


/*
 * Gets the ready state
 * @return {boolean} the ready state
*/
jp.layer.prototype.isReady = function() {
  return this.isReady_;
};


/*
 * Sets the activated state
 *@param {boolean} activate Sets the active state
*/
jp.layer.prototype.setActivated = function(activate) {
  this.isActivated_ = activate;
};


/*
 * Gets the activated state
 * @return {boolean} the activated state
*/
jp.layer.prototype.isActivated = function() {
  return this.isActivated_;
};


/*
 * Sets the parent element for this layer
*/
jp.layer.prototype.setParentElement = function() {
  var element = this.modelContext_['parentElement'];

  if (!element && this.getParent()) {
    element = this.getParent().getChildElement();
  }
  if (!element) {
    myThis = this;
    jp.error(jp.errorCodes['parentMissing'], this.modelName_);
    return;
  }

  this.parentElement_ = element;
};


/*
 * Sets the parent element for this layer
*/
jp.layer.prototype.setChildElement = function() {
  var element = this.modelContext_['childElement'];
  if (!element && this.getChildren()) {
    //jp.error(jp.errorCodes['childMissing'], this.modelName_);
    return;
  }
  this.childElement_ = element;
};

/*
 * Sets the parent element for this layer
*/
jp.layer.prototype.getChildElement = function() {
  return this.childElement_;
};

/*
 * Sets the parent element for this layer
*/
jp.layer.prototype.getParentElement = function() {
  return this.parentElement_;
};


/*
 * Sets the styles for the template to render
*/
jp.layer.prototype.setLayouts = function() {
  this.template_.setLayouts(this.modelName_, this.getModel());
};


/*
 * Loads the layout for a specific model
*/
jp.layer.prototype.loadStyles = function() {
  this.template_.setStyles(this.modelName_, this.getModel());
  var styles = this.template_.getStyles(),
      totalStyles = styles.length,
      i;

  
  // Load the layouts
  if (styles) {
    // If  there are not any styles, then skip this step and load the layouts
    if (styles.length === 0) {
      this.loadLayouts();
      return;
    }
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
jp.layer.prototype.loadLayouts = function() {
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
jp.layer.prototype.renderLayout = function() {
  this.template_.renderLayout(this.modelName_);
};


/*
 * Set some last adjustments and then trigger that it is ready to active
*/
jp.layer.prototype.getReadyToActivate = function() {
  this.setReady(true);
  this.setParentElement();
  this.setChildElement();
  jp.events.talk(this, jp.events.readyToActivate);
}


/*
 * Renders the dom, adds button events and sets html
*/
jp.layer.prototype.activate = function() {
  this.template_.renderDom(this.getParentElement());
  this.matchButtonEvents();
  this.setHtml();
  this.setActivated(true);
  jp.events.talk(this, jp.events.activated);
}


/*
 * Sets all html text
*/
jp.layer.prototype.setHtml = function() {
  jp.ui.setHtmlById('title', this.title_);
};


/*
 * Gets the button maps
*/
jp.layer.prototype.getButtonMap = function() {
  return this.buttonMap_;
}


/*
 * Handles event for an element
*/
jp.layer.prototype.matchButtonEvents = function() {
  var callbackString,
      callbackFunction,
      buttonMaps = this.getButtonMap() || [],
      totalbuttonMaps = buttonMaps.length,
      buttonMap,
      i;

  if (!buttonMaps) {
    return;
  }
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
jp.layer.prototype.addOnClickEvent = function(element, callback) {
  var thisLayer = this;

  $(element).bind('click', (function(evt) {
    callback(evt, thisLayer);
  }));

  $(element).bind('keypress', (function(evt) {
    if (evt.charCode === 32 || evt.key === 'Enter') {
      callback(evt, thisLayer);
    }
  }));
};


/*
 * Renders the dom
*/
jp.layer.prototype.renderDom = function() {
  this.template_.renderDom();
};


/*
 * Loads the style
*/
jp.layer.prototype.loadStyle = function() {
  this.template_.loadStyle(this.modelName_);
};


/*
 * Renders the style
*/
jp.layer.prototype.renderStyle = function() {
  this.template_.renderStyle(this.modelName_);
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.layer.prototype.getModel = function() {
  return this.model_;
};


/*
 * Sets the title
 * @return {Object} the data object.
*/
jp.layer.prototype.setTitle = function(title) {
  this.title_ = title;
};


/*
 * Gets the parent
 * @return {Object} the data object.
*/
jp.layer.prototype.getParent = function() {
  return this.parent_;
};


/*
 * Sets the parent object
 * @param {Object} the parent object.
*/
jp.layer.prototype.setParent = function(parent) {
  this.parent_ = parent;
};


/*
 * Gets the children
 * @return {Array[Objects]} the children object.
*/
jp.layer.prototype.getChildren = function() {
  return this.children_;
};


/*
 * Sets the children object
 * @param {Object} the child object.
*/
jp.layer.prototype.setChildren = function(child) {
  this.children_.push(child);
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.layer.prototype.getData = function() {
  return this.data_;
};

/*
 * Finds specific jsondata
 * @param {Array} data the data to look for.
 * @param {string} type the type to look for.
 * @return {*} the data or null.
*/
jp.layer.prototype.findData = function(data) {
  return this.utility_.findJsonData(data, this.getData());
};
