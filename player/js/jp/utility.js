
/*
 * The Utility class
*/
jp.utility = function() {};


/*
 * Gets a uri parameter.
 * @param {string} param the uri param to try for.
 * @return {string} the param or null.
*/
jp.utility.prototype.getUrlParams = function(param) {
  return decodeURIComponent(
    (new RegExp('[?|&]' + param + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) ||
      [,""])[1].replace(/\+/g, '%20')) || null;

};


/*
 * Finds json data from a haystack.
 * @param {Array} needles the data to look for.
 * @param {Object} haystack the data to search through.
 * @return {*} the data or null.
*/
jp.utility.prototype.findJsonData = function(needles, haystack) {
  var i, needle, found = false;
  for (i in needles) {
    needle = needles[i];
    if (haystack[needle]) {
      haystack = haystack[needle];
      found = true;
    } else {
    }
  }
  return found ? haystack : null;
};
