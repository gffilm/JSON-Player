
/*
 * The Template class
 * @param {string} name the current template name.
*/
jp.template = function(name) {

 /*
  * The layout name
  * @type {string}
 */
  this.name_ = name;

  /*
 * Set the data
 * @type {Object}
 */
  this.config_ = jp.getConfig()[name];

  /*
  * The layout name
  * @type {string}
 */
  this.layoutName_ = this.getConfig()['layout'];

  /*
  * The layout context name
  * @type {string}
 */
  this.layoutContextName_ = this.getConfig()['layoutContext'];


  /*
  * The layout context
  * @type {Object}
 */
  this.layoutContext_ = jp.getLayoutContext()[this.layoutContextName_];

  /*
  * The style context name
  * @type {string}
 */
  this.styleContextName_ = this.getConfig()['styleContext'];


  /*
  * The style context
  * @type {Object}
 */
  this.styleContext_ = jp.getStyleContext()[this.styleContextName_];

  /*
  * The styles
  * @type {string|Array}
 */
  this.styles_ = this.getConfig()['style'];

 /*
  * The style queue
  * @type {Array}
 */
  this.styleQueue_ = [];


  this.dustHelper_ =  new jp.dustHelper();
};


/*
 * Gets the name
 * @return {string} the layout name.
*/
jp.template.prototype.getName = function() {
  return this.name_;
};



/*
 * Gets the layout name
 * @return {string} the layout name.
*/
jp.template.prototype.getLayoutName = function() {
  return this.layoutName_;
};


/*
 * Gets the layout context
 * @return {string} the layout.
*/
jp.template.prototype.getLayoutContext = function() {
  return this.layoutContext_;
};


/*
 * Sets the style
 * @param {string|Array} style the style name.
*/
jp.template.prototype.setStyle = function(style) {
  this.styles_ = style;
};


/*
 * Gets the style
 * @return {string|Array} the style name.
*/
jp.template.prototype.getStyles = function() {
  return this.styles_;
};


/*
 * Gets the style content
 * @return {string} the style name.
*/
jp.template.prototype.getStyleContext = function() {
  return this.styleContext_;
};


/*
 * Adds a style to the queue
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.addStyle = function(path) {
  this.styleQueue_.push(path);
}

/*
 * Loads all styles from the queue in order
*/
jp.template.prototype.loadNextStyle = function(callback) {
  var style;
  if (this.styleQueue_.length > 0) {
    // Get the last item in the queue (lowest priority first)
    style = this.styleQueue_[this.styleQueue_.length -1];
    this.loadStyle(style);
    this.styleQueue_.pop();
  } else {
    jp.events.talk(this, jp.events.allStylesLoaded);
  }
}



/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.loadStyle = function(path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, this.getName());
        dust.loadSource(compiled);
        this.renderStyle(this.getName());
      }.bind(this);

  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['styleMissing']);
  });
}


/*
 * Renders a dust layout to the dom
*/
jp.template.prototype.renderStyle = function() {
  var styleContext = this.getStyleContext(),
      dustHelpers = this.dustHelper_;

      callback = function(error, info) {
        if (error) {
          jp.error(jp.errorCodes['dustError'], error);
          return;
        }
        this.addCssText(info);
        this.loadNextStyle();
    }.bind(this);
  if (!styleContext) {
    jp.error(jp.errorCodes['dustMarkup'], this.getName());
  } else {
    $.extend(styleContext, dustHelpers);
    dust.render(this.getName(), styleContext, callback);
  }
};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.loadLayout = function(path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, this.getLayoutName());
        dust.loadSource(compiled);
        jp.events.talk(this, jp.events.layoutLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['layoutMissing'], path);
  });
}


/*
 * Renders a dust layout and stores the element
*/
jp.template.prototype.renderLayout = function() {
  var layoutContext = this.getLayoutContext(),
      dustHelpers = this.dustHelper_,
      element;

    callback = function(error, html) {
      if (error) {
        jp.error(jp.errorCodes['dustError'], error);
        return;
      }
      element = this.convertLayoutToNode(html);
      if (element) {
        this.renderedElement_ = element;
        jp.events.talk(this, jp.events.elementRendered);
      }
    }.bind(this);

  if (!layoutContext) {
    jp.error(jp.errorCodes['dustMarkup']);
  } else {
    $.extend(layoutContext, dustHelpers);
    dust.render(this.getLayoutName(), layoutContext, callback);
  }
};


/*
 * Renders the created element to the dom
 * @param {parent} parent the element to append this element to.
*/
jp.template.prototype.renderDom = function(parent) {
  myP = parent;
  p = $(myP);
  $(parent).append(this.renderedElement_);
};


/*
 * Converts a dust string into a node.
 * @param {string} htmlString the html in string format.
 * @return {Node} the node created.
*/
jp.template.prototype.convertLayoutToNode = function(htmlString) {
  var div = document.createElement('div'),
      node;

  div.innerHTML = "<br>" + htmlString;
  div.removeChild(div.firstChild)

  if (div.childNodes.length == 1) {
    return div.removeChild(div.firstChild)
  } else {
    element = document.createDocumentFragment();
    while (div.firstChild) {
      element.appendChild(div.firstChild)
    }
    return element
  }
};



/**
 * Writes a CSS node used to add a style to.
 * @return {Element} The cssNode to embed the styles to.
 */
jp.template.prototype.getCssNode = function() {
  if (this.cssNode_) {
    return this.cssNode_;
  }

  var cssNode = document.createElement('style'),
      head = document.getElementsByTagName('head')[0];

  cssNode.type = 'text/css';
  head.appendChild(cssNode);
  this.cssNode_ = cssNode;

  // Add event listeners for when the page is removed or when the engine reboots
  jp.events.listen(jp.engineInstance, jp.events.reboot, this.removeCss, this);
  jp.events.listen(this, jp.events.removeCss, this.removeCss, this);
  return this.cssNode_;
};


/**
 * Removes the css Node on an event call
 */
jp.template.prototype.removeCss = function() {
  if (this.cssNode_) {
    jp.ui.removeElement(this.cssNode_);
  }
};



/**
 * Adds CSS text to the dom's <head>
 * @param {string} cssText CSS to add to the end of the document.
 */
jp.template.prototype.addCssText = function(cssText) {
  var cssNode = this.getCssNode(),
      cssTextNode = document.createTextNode(cssText);

  if (cssNode.styleSheet) {
    // IE implementation
    cssNode.styleSheet.cssText += cssText;
  } else {
    // Most browsers
    cssNode.appendChild(cssTextNode);
  }
};



/**
 * Gets the rendered layout
 * @return {Element} The rendered layout
 */
jp.template.prototype.getRenderedLayout = function() {
  return this.renderedElement_;
};


/*
 * Gets the config data
 * @return {Object} the config data object.
*/
jp.template.prototype.getConfig = function() {
  return this.config_;
};

