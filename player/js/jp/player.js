
/*
 * The page class
 * @param {string} the model name.
 * @param {Object} the model. 
 * @extendts jp.page
*/
jp.player = function(modelName, model) {
  jp.base(this, modelName, model);
};
jp.inherits(jp.player, jp.page);