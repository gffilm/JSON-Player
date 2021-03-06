
/*
 * The Global deps object
 */
var deps = {};

/*
 * Define if production mode
 * @define Production mode
 */
deps.PRODUCTION_MODE = false;


/*
 * The startup function called from the index file
 * @public
*/
deps.loadScripts = function() {
  var verifyAPIs,
      libraries,
      loadCount = 0,
      apis = ['Modernizr', 'jQuery', 'dust', 'jp'],
      loadError = false,
      currentApi;

  // Set the scripts
  if (deps.PRODUCTION_MODE) {
    scripts = [
    'js/lib/min/modernizr.min.js',
    'js/lib/min/jquery-1.11.1.min.js',
    'js/lib/min/dust-full.min.js',
    'js/compiled.js'
    ];
  } else {
    scripts = [
    'js/lib/modernizr.js',
    'js/lib/jquery-1.11.1.js',
    'js/lib/dust-full.js',
    'js/jp/base.js',
    'js/jp/engine.js',
    'js/jp/layer.js',
    'js/jp/player.js',
    'js/jp/logger.js',
    'js/jp/events.js',
    'js/jp/template.js',
    'js/jp/dustHelper.js',
    'js/jp/ui.js',
    'js/jp/utility.js'
    ];
    apis.push('jp.engine');
    apis.push('jp.layer');
    apis.push('jp.player');
    apis.push('jp.logger');
    apis.push('jp.events');
    apis.push('jp.template');
    apis.push('jp.dustHelper');
    apis.push('jp.ui');
    apis.push('jp.utility');
  }

  verifyAPI = function() {
    var verified = true,
        api = apis[loadCount].split('.'),
        apiFunctionn;
    // increment the load count
    loadCount++;

    if (!api) {
      // Allow this for now
      return true;
    }
    // determine if the api function is a subclass
    if (api[1]) {
      apiFunctionn = window[api[0]];
      return (apiFunctionn[api[1]]);
    } else {
      return (window[api]);
    }
  }


  missingApi = function(missingAPI) {
    document.title = 'Load Error';
    alert('Failed to load required script: ' + missingAPI +  '\n\nPackage failed to build properly');
  }

  // verify yepnope is loaded, this is loaded from the index file
  try {
    if (yepnope) {
      // do nothing
    }
  } catch (e) {
    missingApi('yepnope');
    return;
  }

  // use the yepnope script loader to load all scripts
  yepnope({
    load: scripts,
    callback: function(url) {
      if (!verifyAPI()) {
        if (!loadError) {
          document.title = 'Load Error';
          missingApi(currentApi);
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
