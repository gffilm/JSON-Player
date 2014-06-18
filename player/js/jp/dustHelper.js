/*
 * The Dust Helper class
 * The functions within this class are passed to the dust renderer to handle
*/
jp.dustHelper = function() {

  this.utility_ = new jp.utility();

  this.data_ = jp.engineInstance.getJsonData();

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


  /**
  * Macro for getting a defined localized variable
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the defined item
   */
  this.localize = function(chunk, context, bodies, params) {
    var id = params.id.split('.'),
        localized = this.findDataByType(id, 'localization');

    if (!localized || typeof(localized) === 'object') {
      jp.error(jp.errorCodes.localizedStringMissing, id);
      localized = '';
    }

    return chunk.write(localized);
  }
};


/*
 * Finds specific jsondata
 * @param {Array} data the data to look for.
 * @param {string} type the type to look for.
 * @return {*} the data or null.
*/
jp.dustHelper.prototype.findDataByType = function(data, type) {
  return this.utility_.findJsonData(data, this.data_[type]);
};

