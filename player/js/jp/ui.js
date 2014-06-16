
/*
 * The UI class
*/
jp.ui = function() {};


/*
 * Sets the innerHTML of an element
 * @param {string} id the element id.
 * @param {string} innerHTML the innerHtml to set.
*/
jp.ui.setHtmlById = function(id, innerHTML) {
  $('#' + id).html(innerHTML);
};


/*
 * Creates an element
 * @param {string} type the element type.
 * @param {string=} id the element id.
 * @param {string=} className the element class.
 * @param {string=} innerHTML the innerHtml to set.
 * @return {Element} the element created
*/
jp.ui.createElement = function(type, id, className, innerHTML) {
  return jQuery('<' +type + '>', {
    'id': id,
    'text': innerHTML,
    'class': className
  });
}



/*
 * Rempves an element from the DOM
 * @param {Element} the element to remove
*/
jp.ui.removeElement = function(element) {
  try {
    element.remove();
  } catch(e) {
    element.parentNode.removeChild(element);
  }
};