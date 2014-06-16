
/*
 * The Global object
 */
var jp = {};

/*
 * Define if production code
 * @define Production code
 */
jp.PRODUCTION = false;


/*
 * Avoids errors if there is not a console
*/
if (!window.console) {
  console = {};
  console.log = function() {};
}


/**
 * Pure-JS implementation of jp.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object
 * @param {...*} var_args Additional arguments
 * @return {!Function} A partially-applied form of the function bind()
 * @private
 */
jp.bindJs = function(fn, selfObj, var_args) {
  var context = selfObj || jp.global,
      newArgs,
      boundArgs;
  if (arguments.length > 2) {
    boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs);
    };

  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
};


/**
 * A native implementation of jp.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj the object itself.
 * @param {...*} var_args Additional arguments
 * @return {!Function} the function to bind
 * @private
 */
jp.bindNative = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments);
};


/**
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object
 * @param {...*} var_args Additional arguments
 * @return {!Function} the function bind()
 */
jp.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind &&
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    jp.bind = jp.bindNative;
  } else {
    jp.bind = jp.bindJs;
  }
  return jp.bind.apply(null, arguments);
};
