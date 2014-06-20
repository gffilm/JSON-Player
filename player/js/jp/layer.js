
/*
 * The layer class
 * @param {string} name the current layer name.
*/
jp.layer = function(name) {

  if (!name) {
    return;
  }

  /*
 * Set the utility
 * @type {Object}
 */
  this.utility_ = new jp.utility();

  // Set the model name
  this.name_ = name;

  // Set the config
  this.config_ = jp.getConfig()[name];

  // Set the model name
  this.modelName_ = this.config_['model'];

  // Set the model to the current model name
  this.model_ = jp.getModel()[this.modelName_];

  // The parent element for this node
  this.parentElement_ = this.getModel()['parentElement'];

  // The child element for this node
  this.childElement_ = this.getModel()['childElement'];

  // Set the model to the current model name
  this.buttonMap_ = this.getModel()['buttonMap'];

  // The model's parent
  this.parent_;

  // The model's state
  this.isReady_= false;

  // The model's active state
  this.isActivated_ = false;

  // The model's active state
  this.isRequired_ = this.getModel()['required'] || true;

  // The model's children
  this.children_ = this.getModel()['children'] || [];

  // Create a template instance
  this.template_ = new jp.template(this.modelName_);

  // Set and load styles and layouts
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
  this.template_.setStyles();
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
  this.template_.setLayouts();
};


/*
 * Loads the layout for a specific model
*/
jp.layer.prototype.loadStyles = function() {
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
      this.template_.addStyle('../courses/45666/assets/global/styles/' + styles[i] + '.css');
      this.template_.addStyle('assets/global/styles/' + styles[i] + '.css');
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
  if (this.template_.layoutName_) {
    this.template_.loadLayout('assets/global/layouts/' + this.template_.layoutName_ + '.html');
  } else {
    jp.error(jp.errorCodes['layoutMissingFromConfig']);
  }
};


/*
 * Renders the layout
*/
jp.layer.prototype.renderLayout = function() {
  this.template_.renderLayout();
};


/*
 * Set some last adjustments and then trigger that it is ready to active
*/
jp.layer.prototype.getReadyToActivate = function() {
  this.setReady(true);
  jp.events.talk(this, jp.events.readyToActivate);
}


/*
 * Renders the dom, adds button events and sets html
*/
jp.layer.prototype.activate = function() {
  this.template_.renderDom(this.getParentElement());
  this.matchButtonEvents();
  this.setActivated(true);
  jp.events.talk(this, jp.events.activated);
}


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
  this.template_.loadStyle();
};


/*
 * Renders the style
*/
jp.layer.prototype.renderStyle = function() {
  this.template_.renderStyle();
};


/*
 * Gets the jsondata
 * @return {Object} the data object.
*/
jp.layer.prototype.getModel = function() {
  return this.model_;
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
 * Gets the config data
 * @return {Object} the config data object.
*/
jp.layer.prototype.getConfig = function() {
  return this.config_;
};
