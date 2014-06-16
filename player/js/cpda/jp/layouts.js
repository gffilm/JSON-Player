
/*
 * The Layouts class
*/
jp.layouts = function() {

 /*
  * The layout name
  * @type {string}
 */
  this.layout_;

 /*
  * The layout content
  * @type {string}
 */
  this.layoutContent_;
};



/*
 * Sets the layout
 * @param {string} layout the layout name.
*/
jp.layouts.prototype.setLayout = function(layout) {
  this.layout_ = layout;
};


/*
 * Gets the layout
 * @return {string} the layout name.
*/
jp.layouts.prototype.getLayout = function() {
  return this.layout_;
};

/*
 * Sets the layout content
 * @param {string} layoutContent the layout name.
*/
jp.layouts.prototype.setLayoutContent = function(layoutContent) {
  this.layoutContent_ = layoutContent;
};


/*
 * Gets the layout content
 * @return {string} the layout name.
*/
jp.layouts.prototype.getLayoutContent = function() {
  return this.layoutContent_;
};


/*
 * Sets the style
 * @param {string|Array} style the style name.
*/
jp.layouts.prototype.setStyle = function(style) {
  this.style_ = style;
};


/*
 * Gets the style
 * @return {string|Array} the style name.
*/
jp.layouts.prototype.getStyles = function() {
  return this.style_;
};

/*
 * Sets the style content
 * @param {string} styleContent the style name.
*/
jp.layouts.prototype.setStyleContent = function(styleContent) {
  this.styleContent_ = styleContent;
};


/*
 * Gets the style content
 * @return {string} the style name.
*/
jp.layouts.prototype.getStyleContent = function() {
  return this.styleContent_;
};

/*
 * Set the layouts defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.layouts.prototype.renderJsonLayouts = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      layout = util.findJsonData([jsonTitle, 'layout'], jsonData);
      layoutContent = util.findJsonData([jsonTitle, 'layoutContent'], jsonData);

  this.setLayout(layout);
  this.setLayoutContent(layoutContent);
};


/*
 * Set the layouts defined from the json
 * @param {string} jsonTitle the data object's key name.
 * @param {Object} jsonData the data object
*/
jp.layouts.prototype.renderJsonStyles = function(jsonTitle, jsonData) {
  var util = new jp.utility(),
      style = util.findJsonData([jsonTitle, 'style'], jsonData);
      styleContent = util.findJsonData([jsonTitle, 'styleContent'], jsonData);

  this.setStyle(style);
  this.setStyleContent(styleContent);
};


/*
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.layouts.prototype.loadLayout = function(name, path) {
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
jp.layouts.prototype.renderLayout = function(name) {
  var data = jp.engineInstance.getJsonData(),
      layoutContent = this.getLayoutContent(),
      jsonData = data[layoutContent],
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
    dust.render(name, jsonData, callback);
  }
};


/*
 * Renders the created element to the dom
 * @param {string} name the layout name.
*/
jp.layouts.prototype.renderDom = function() {
  $('body').append(this.renderedElement_);
};


/*
 * Converts a dust string into a node.
 * @param {string} htmlString the html in string format.
 * @return {Node} the node created.
*/
jp.layouts.prototype.convertLayoutToNode = function(htmlString) {
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
 * Gets a dust layout based on a path and renders it once loaded.
 * @param {string} name the name of the layout to load.
 * @param {string} path the uri of the layout to load.
*/
jp.layouts.prototype.loadStyle = function(name, path) {
  var compiled,
      success = function(data) {
        compiled = dust.compile(data, name);
        dust.loadSource(compiled);
        jp.events.talk(this, jp.events.styleLoad);
      }.bind(this);
  $.get(path, success).fail(function() {
    jp.error(jp.errorCodes['styleMissing']);
  });
}


/*
 * Renders a dust layout to the dom
 * @param {string} name the layout name.
 * @param {Element} parent the parent element to load the template into.
*/
jp.layouts.prototype.renderStyle = function(name, parent) {
  var data = jp.engineInstance.getJsonData(),
      styleContent = this.getStyleContent(),
      jsonData = data[styleContent],
      callback = function(error, info) {
        if (error) {
          jp.error(jp.errorCodes['dustError'], error);
          return;
        }
        this.addCssText(info);
    }.bind(this);
  if (!jsonData) {
    jp.error(jp.errorCodes['dustMarkup'], name);
  } else {
    dust.render(name, jsonData, callback);
  }
};


/**
 * Writes a CSS node used to add a style to.
 * @return {Element} The cssNode to embed the styles to.
 */
jp.layouts.prototype.getCssNode = function() {
  if (this.cssNode_) {
    return this.cssNode_;
  }

  var cssNode = document.createElement('style'),
      head = document.getElementsByTagName('head')[0];

  cssNode.type = 'text/css';
  head.appendChild(cssNode);
  this.cssNode_ = cssNode;
  mynode = this.cssNode_;
  return this.cssNode_;
};



/**
 * Adds CSS text to the dom's <head>
 * @param {string} cssText CSS to add to the end of the document.
 */
jp.layouts.prototype.addCssText = function(cssText) {
  var cssNode = this.getCssNode(),
      cssTextNode = document.createTextNode(cssText);

  if (cssNode.styleSheet) {
    // IE implementation
    cssNode.styleSheet.cssText += cssText;
  } else {
    // Most browsers
    cssNode.appendChild(cssTextNode);
  }
  jp.events.talk(this, jp.events.styleLoaded);
};
