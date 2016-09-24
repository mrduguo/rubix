function onAppLoaded (errorMessage) {
  window.BOOTSTRAP_OK = true;
  var loader = document.getElementById('loader-wrapper');
  if (loader) {
    var loadTime = Date.now() - window.StartTime;
    var minimalSpinnerTime = 5000;
    if (loadTime < minimalSpinnerTime) {
      setTimeout(function () {
        loader.parentElement.removeChild(loader);
      }, (minimalSpinnerTime - loadTime));
    } else {
      loader.parentElement.removeChild(loader);
    }

    if (errorMessage) {
      console.log('errorMessage:');
      console.log(errorMessage);
      document.getElementById('app').innerHTML =
        '<div class="loader-error"><div class="title">ERROR CODE: ' + errorMessage.code + '</div>' +
        '<div class="message">ERROR MESSAGE:' + errorMessage.message + '</div></div>'
      ;
    }
  }
};

(function () {
// Retrieved and slightly modified from: https://github.com/typicode/pegasus
// --------------------------------------------------------------------------
//
// a   url (naming it a, beacause it will be reused to store callbacks)
// xhr placeholder to avoid using var, not to be used
  window.pegasus = function pegasus (a, xhr) {
    xhr = new XMLHttpRequest();

    // Open url
    xhr.open('GET', a);

    // Reuse a to store callbacks
    a = [];

    // onSuccess handler
    // onError   handler
    // cb        placeholder to avoid using var, should not be used
    xhr.onreadystatechange = xhr.then = function (onSuccess, onError, cb, result) {

      // Test if onSuccess is a function or a load event
      if (onSuccess.call) a = [onSuccess, onError];

      // Test if request is complete
      if (xhr.readyState == 4) {

        try {
          if (xhr.status === 200 || xhr.status === 0) {
            result = JSON.parse(xhr.responseText);
            cb = a[0];
          } else {
            result = new Error('Status: ' + xhr.status);
            cb = a[1];
          }
        } catch (e) {
          result = e;
          cb = a[1];
        }

        // Safari doesn't support xhr.responseType = 'json'
        // so the response is parsed
        if (cb) cb(result);
      }
    };

    // Send
    xhr.send();

    // Return request
    return xhr;
  };
//------------------------------------------------------------------
// Step 2: After fetching manifest (localStorage or XHR), load it
  function loadManifest (manifest) {
    window.Manifest = manifest;
    if (!manifest.load) {
      onAppLoaded({'code': 'ERR002', 'message': 'Manifest has nothing to load (manifest.load is empty).'});
      return;
    }

    var el,
      head = document.getElementsByTagName('head')[0],
      scripts = manifest.load.concat();

    // Load Scripts
    function loadScripts () {
      scripts.forEach(function (src) {
        if (!src) return;
        // Load javascript
        if (src.substr(-3) === ".js") {
          el = document.createElement('script');
          el.charset = "UTF-8";
          el.type = 'text/javascript';
          el.src = src + '?v=' + manifest.version;
          el.async = false;
          // Load CSS
        } else {
          el = document.createElement('link');
          el.rel = "stylesheet";
          el.href = src + '?' + manifest.version;
          el.type = "text/css";
        }
        head.appendChild(el);
      });
    }

    if (typeof window.cordova !== 'undefined') {
      document.addEventListener("deviceready", loadScripts, false);
    } else {
      loadScripts();
    }
    // Save to global scope
  }

//---------------------------------------------------------------------
  window.bootstrapLoadManifest = function (source, callback, onError) {
    var url = document.querySelector('script[manifest]').getAttribute('manifest');
    pegasus(url + '?s=' + source + '&s=' + Date.now()).then(callback, onError);
  };

  window.StartTime = Date.now();
  bootstrapLoadManifest('onload', loadManifest, function (xhr) {
    onAppLoaded({'code': 'ERR001', 'message': 'Could not download ' + url + ': ' + xhr.status});
  });
})();
