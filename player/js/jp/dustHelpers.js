/*
 * The Dust Helpers class
*/
jp.dustHelpers = function() {

  /**
  * Macro for getting a defined variable (could be anything: size, color, etc.)
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the defined item
   */
  this.define = function(chunk, context, bodies, params) {
    var cssName = params.name,
        cssValue = context.get(cssName);
        brandedValue = context.get(cssValue);
    
    // If no brand exists, add a warning and fallback to the dsx value
    if (!brandedValue && cssValue) {
      brandedValue = cssValue;
    }

    return chunk.write(brandedValue);
  }
};
