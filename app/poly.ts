export const features = [
  'fetch',
  'Map',
  'Promise',
  'requestAnimationFrame',
  'Set',
  'URL',
  'URLSearchParams',
];

function browserSupportsAllFeatures(): boolean {
  // @ts-ignore - because don't want to add an any index to Window
  return features.every((f) => window[f]);
}

function missingFeatures(): string[] {
  // @ts-ignore - because don't want to add an any index to Window
  return features.filter((f) => !window[f]);
}

/**
 * Load polyfill scripts for missing features
 */
function loadScript(done: Function): void {
  // eslint-disable-next-line prefer-template
  const cdn = 'https://cdn.polyfill.io/v2/polyfill.min.js?features=' + missingFeatures().join();
  const js = document.createElement('script');
  js.src = cdn;
  js.onload = function onLoad(): void {
    done();
  };
  js.onerror = function onError(): void {
    // eslint-disable-next-line prefer-template
    done(new Error('Failed to load script ' + cdn));
  };
  document.head.appendChild(js);
}

/**
 * Load Polyfills for browser features that are missing
 */
export const poly = (done: (err?: Error) => void): void => {
  if (browserSupportsAllFeatures()) {
    done();
  } else {
    loadScript(done);
  }
};
