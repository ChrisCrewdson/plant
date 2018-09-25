const features = [
  'fetch',
  'Map',
  'Promise',
  'requestAnimationFrame',
  'Set',
  'URL',
  'URLSearchParams',
];

function browserSupportsAllFeatures() {
  // @ts-ignore - because don't want to add an any index to Window
  return features.every(f => window[f]);
}

function missingFeatures() {
  // @ts-ignore - because don't want to add an any index to Window
  return features.filter(f => !window[f]);
}

/**
 * Load polyfill scripts for missing features
 * @param {Function} done
 */
function loadScript(done) {
  // eslint-disable-next-line prefer-template
  const cdn = 'https://cdn.polyfill.io/v2/polyfill.min.js?features=' + missingFeatures().join();
  const js = document.createElement('script');
  js.src = cdn;
  js.onload = function onLoad() {
    done();
  };
  js.onerror = function onError() {
    // eslint-disable-next-line prefer-template
    done(new Error('Failed to load script ' + cdn));
  };
  document.head.appendChild(js);
}

/**
 * Load Polyfills for browser features that are missing
 * @param {Function} done
 */
module.exports = (done) => {
  if (browserSupportsAllFeatures()) {
    done();
  } else {
    loadScript(done);
  }
};

// Export to help with testing
module.exports.features = features;
