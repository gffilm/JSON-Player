
/*
 * The logger class
*/
jp.logger = function() {};


/*
 * The Error objects wih a code and detail
 */
jp.errorCodes = {
  'libraryLoad': {'code': 'loader-001', 'detail': 'Error loading libraries'},
  'jsonLoad': {'code': 'loader-002', 'detail': 'Error loading json files'},
  'dustError': {'code': 'dust-001', 'detail': 'Error parsing dust file'},
  'dustMarkup': {'code': 'dust-002', 'detail': 'Dust markup missing'},
  'layoutMissing': {'code': 'dust-003', 'detail': 'Dust layout missing'},
  'layoutMissingFromConfig': {'code': 'dust-004', 'detail': 'Dust layout missing from config'},
  'layoutContentMissing': {'code': 'dust-005', 'detail': 'Dust layout content missing'},
  'styleMissing': {'code': 'dust-003', 'detail': 'Dust layout missing'},
  'styleMissingFromConfig': {'code': 'css-001', 'detail': 'Styles missing'},
  'localizedStringMissing': {'code': 'dust-004', 'detail': 'Localized text not found for id'}
};


/*
 * Logs an error
 * @param {jp.errorCodes} error the error object.
 * @param {string=} optInfo optional error information.
 * @param {boolean=} critical errors throw an alert and stops script execution
*/
jp.error = function(error, optInfo, critical) {
  if (optInfo) {
    console.log(error['detail'] + ' - ', optInfo);
  } else {
    console.log(error['detail']);
  }
  if (critical) {
    alert(error['detail'] + '\n\nErrorCode:' + error['code']);
    throw Error('Critical error occurred');
  }
};


/*
 * Logs an entry
 * @param {string} name the logging name.
 * @param {string} value the logging value.
*/
jp.log = function(name, value) {
  console.log(name, value);
};
