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
    var dss = params.name,
        rgba = params.rgba,
        dsx = context.get(dss),
        brand = context.get(dsx),
        render;
    
    // If no brand exists, add a warning and fallback to the dsx value
    if (!brand && dsx) {
      brand = dsx;
    }

    render = brand;
    return chunk.write(render);
  }
}