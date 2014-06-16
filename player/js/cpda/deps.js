
/*
 * The Global loader object
 */
var loader = {};

/*
 * Define if production mode
 * @define Production mode
 */
loader.PRODUCTION_MODE = true;


/*
 * The startup function called from the index file
 * @public
*/
loader.loadScripts = function() {
  var verifyAPIs,
      libraries,
      loadCount = 0,
      apis = ['Modernizr', 'jQuery', 'dust', 'jp'],
      loadError = false,
      currentApi;

  // Set the libraries
  if (loader.PRODUCTION_MODE) {
    libraries = [
    'js/lib/min/modernizr.min.js',
    'js/lib/min/jquery-1.11.1.min.js',
    'js/lib/min/dust-full-0.3.0.min.js',
    'js/cpda/compiled.js'
    ];
  } else {
    libraries = [
    'js/lib/modernizr.js',
    'js/lib/jquery-1.11.1.js',
    'js/lib/dust-full-0.3.0.js',
    'js/cpda/compiled.js'
    ];
  }

  verifyAPI = function() {
    var verified = true,
        api = apis[loadCount];
    loadCount++;
    currentApi = api;
    return (window[api]);
  }

  yepnope({
    load: libraries,
    callback: function(url) {
      if (!verifyAPI()) {
        if (!loadError) {
          document.title = 'Load Error';
          alert('Failed to load required script: ' + currentApi +  '\n\nPackage failed to build properly');
          loadError = true;
        }
        return;
      }
    },
    complete: function() {
      if (!loadError) {
        jp.startup();
      }
    }
  });
};
