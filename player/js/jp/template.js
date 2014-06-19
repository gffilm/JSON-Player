
/*
 * The Template class
*/
jp.template = function(data) {

 /*
  * The layout name
  * @type {string}
 */
  this.layout_;

  /*
 * Set the data
 * @type {Object}
 */
  this.data_ = data;

 /*
  * The layout content
  * @type {string}
 */
  this.layoutContent_;

 /*
  * The style queue
  * @type {Array}
 */
  this.styleQueue_ = [];


  this.dustHelper_ =  new jp.dustHelper(data);
};



/*
 * Sets the layout
 * @param {string} layout the layout name.
*/
jp.template.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};


/*
 * Gets the layout
 * @return {string} the layout name.
*/
jp.template.prototype.getLayout = function() {
  return this.layout_;
};

/*
 * Sets the layout content
 * @param {string} layoutContent the layout name.
*/
jp.template.prototype.setLayoutContent = function(layoutContent) {
  this.layoutContent_ = layoutContent;
};


/*
 * Gets the layout content
 * @return {string} the layout name.
*/
jp.template.prototype.getLayoutContent = function() {
  return this.layoutContent_;
};


/*
 * Sets the style
 * @param {string|Array} style the style name.
*/
jp.template.prototype.setStyle = function(style) {
  this.style_ = style;
};


/*
 * Gets the style
 * @return {string|Array} the style name.
*/
jp.template.prototype.getStyles = function() {
  return this.style_;
};

/*
 * Sets the style content
 * @param {string} styleContent the style name.
*/
jp.template.prototype.setStyleContent = function(styleContent) {
  this.styleContent_ = styleContent;
};


/*
 * Gets the style content
 * @return {string} the style name.
*/
jp.template.prototype.getStyleContent = function() {
  return this.styleContent_;
};

/*
 * Set the layouts defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.template.prototype.setLayouts = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      layout = util.findJsonData([jsonTitle, 'layout'], jsonData);
      layoutContent = util.findJsonData([jsonTitle, 'layoutContext'], jsonData);

  this.setLayout(layout);
  this.setLayoutContent(layoutContent);
};


/*
 * Set the styles defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.template.prototype.setStyles = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      style = util.findJsonData([jsonTitle, 'style'], jsonData);
      styleContent = util.findJsonData([jsonTitle, 'styleContext'], jsonData);

  this.setStyle(style);
  this.setStyleContent(styleContent);
};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.loadLayout = function(name, path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        jp.events.talk(this, jp.events.layoutLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['layoutMissing']);
  });
}


/*
 * Renders a dust layout and stores the element
 * @param {string} name the layout name.
*/
jp.template.prototype.renderLayout = function(name) {
  var data = this.data_,
      layoutContent = this.getLayoutContent(),
      jsonData = data[layoutContent],
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

  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup']);
  } else {
    $.extend(jsonData, dustHelpers);
    dust.render(name, jsonData, callback);
  }
};


/*
 * Renders the created element to the dom
 * @param {string} name the layout name.
*/
jp.template.prototype.renderDom = function() {
  $('body').append(this.renderedElement_);
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


/*
 * Adds a style to the queue
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.addStyle = function(name, path) {
  this.styleQueue_.push({'name':name, 'path':path});
}

/*
 * Loads all styles from the queue in order
*/
jp.template.prototype.loadNextStyle = function(callback) {
  var style;
  if (this.styleQueue_.length > 0) {
    // Get the last item in the queue (lowest priority first)
    style = this.styleQueue_[this.styleQueue_.length -1];
    this.loadStyle(style['name'], style['path']);
    this.styleQueue_.pop();
  } else {
    jp.events.talk(this, jp.events.allStylesLoaded);
  }
}



/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.template.prototype.loadStyle = function(name, path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        this.renderStyle(name);
      }.bind(this);

  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['styleMissing']);
  });
}


/*
 * Renders a dust layout to the dom
 * @param {string} name the layout name.
*/
jp.template.prototype.renderStyle = function(name) {
  var data = this.data_,
      styleContent = this.getStyleContent(),
      jsonData = data[styleContent],
      dustHelpers = this.dustHelper_;
      callback = function(error, info) {
        if (error) {
          jp.error(jp.errorCodes['dustError'], error);
          return;
        }
        this.addCssText(info);
        this.loadNextStyle();
    }.bind(this);
  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup'], name);
  } else {
    $.extend(jsonData, dustHelpers);
    dust.render(name, jsonData, callback);
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
  jp.events.listen(jp.engineInstance, jp.events.reboot, this.removeCss, this).
            listen(this, jp.events.removeCss, this.removeCss, this);
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

