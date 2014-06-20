/*
 * The Dust Helper class
 * The functions within this class are passed to the dust renderer to handle
*/
jp.dustHelper = function() {

  this.utility_ = new jp.utility();

  this.data_ = jp.getContent();

  this.config_ = this.data_['config'];

  this.localization_ = this.data_['localization'];

  this.dustContext_ = this.data_['dustContext'];

  /**
  * Macro for getting a defined variable (could be anything: size, color, etc.)
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the defined item
   */
  this.define = function(chunk, context, bodies, params) {
    var render = this.getDustContext(context, params.name);

    return chunk.write(render);
  }


  /**
  * Macro for getting a defined localized variable
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the defined item
   */
  this.localize = function(chunk, context, bodies, params) {
    var id = params.id.split('.'),
        localized = this.findData(id, this.localization_);

    if (!localized || typeof(localized) === 'object') {
      jp.error(jp.errorCodes.localizedStringMissing, id);
      localized = '';
    }

    return chunk.write(localized);
  }


  /**
  * Macro for getting an asset
  * @param {object} chunk is a dust object, see above
  * @param {object} context a dust object, see above
  * @param {object} bodies a dust object, see above
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the asset
  */
  this.asset = function(chunk, context, bodies, params) {
    var name = params.name,
        relative = 'assets/global/images/',
        path = document.location.pathname + relative + name;

    return chunk.write(path);
  }


  /**
  * Macro for getting a defined localized variable
  * @param {object} params the variables placed in the dss/dsx files
  * @return {chunk} compiled dss of the defined item
   */
  this.gradient = function(chunk, context, bodies, params) {
    var gradient = this.getDustContext(context, params.name),
        gT,
        gS,
        gE,
        gL,
        c = ',',
        gCombined,
        render;

    if (!gradient || !gradient['type']) {
      jp.error(jp.errorCodes.gradientMissing, params.name);
      return chunk.write('');
    }

    g = gradient;
    gT = g['type'];
    gS = g['start'];
    gE = g['end'];
    gL = g['legacy'];
    gCombined = gT + c + gS + c + gE;



    render = 'background: ' + gL + ';' +
      'background: -moz-linear-gradient(' + gCombined + ');' +
      'background: -webkit-linear-gradient(' + gCombined + ');' +
      'background: -o-linear-gradient(' + gCombined + ');' +
      'background: -ms-linear-gradient('+ gCombined + ');' +
      'background: linear-gradient(' + gCombined + ');' +
      'background: -webkit-gradient(linear, '+ gCombined + ')';

    return chunk.write(render);
  }
};


/*
 * Finds specific jsondata
 * @param {Array} data the data to look for.
 * @param {string} object the object to look inside of.
 * @return {*} the data or null.
*/
jp.dustHelper.prototype.findData = function(data, object) {
  return this.utility_.findJsonData(data, object);
};



/*
 * Gets the branded value from a parameter
 * @param {string} type the type to look for.
 * @return {string} the data or null.
*/
jp.dustHelper.prototype.getDustContext = function(context, param) {
  var value = context.get(param);

  return this.dustContext_[value];
};
