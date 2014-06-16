
/*
 * The page class
 * @param {string} the model name.
 * @param {Object} the model. 
*/
jp.page = function(modelName, model) {
  this.modelName_ = modelName;
  this.jsonData_ = model;
  this.template_ = new jp.template;
  this.loadStyles();
  this.loadLayouts();
  jp.events.listen(this.template_, jp.events.styleLoad, this.renderStyle, this);
  jp.events.listen(this.template_, jp.events.layoutLoad, this.renderLayout, this);
  jp.events.listen(this.template_, jp.events.elementRendered, this.setButtonEvents, this);
};


/*
 * Loads the layout for a specific model
*/
jp.page.prototype.loadStyles = function() {
  this.template_.renderJsonStyles(this.modelName_, this.getJsonData());
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
  this.template_.renderJsonLayouts(this.modelName_, this.getJsonData());
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


/*
 * Sets button events
*/
jp.page.prototype.setButtonEvents = function() {
  var buttons = this.template_.renderedElement_.getElementsByClassName('button'),
      totalButtons = buttons.length,
      button,
      i;

  for (i = 0; i < totalButtons; i++) {
    button = buttons[i];
    this.onClickEvent(button);
  }

  this.template_.renderDom();
};

/*
 * Handles event for an element
*/
jp.page.prototype.onClickEvent = function(element) {
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
jp.page.prototype.getJsonData = function() {
  return this.jsonData_;
};