const poly = require('../../app/poly');

describe('/app/poly', () => {
  test('should have not have all features by default', (done) => {
    // Fake the call to document.createElement
    const docCreateElement = document.createElement;
    const docElement = {};
    document.createElement = () => docElement;

    const headAppendChild = document.head.appendChild;
    document.head.appendChild = () => {
      // At this point the target code will have added the onload
      // prop to the document element.
      docElement.onload();
    };

    // Run test
    poly((error) => {
      expect(error).toBeUndefined();

      // Restore the document objects
      document.createElement = docCreateElement;
      document.head.appendChild = headAppendChild;

      done();
    });
  });

  test('should handle an onError', (done) => {
    // Fake the call to document.createElement
    const docCreateElement = document.createElement;
    const docElement = {};
    document.createElement = () => docElement;

    const headAppendChild = document.head.appendChild;
    document.head.appendChild = () => {
      // At this point the target code will have added the onload
      // prop to the document element.
      docElement.onerror();
    };

    // Run test
    poly((error) => {
      expect(error).toBeInstanceOf(Error);

      // Restore the document objects
      document.createElement = docCreateElement;
      document.head.appendChild = headAppendChild;

      done();
    });
  });

  test('should have all features', (done) => {
    // Discover the features that are missing from the window object
    // and set each one to true to force a different code path.
    const { features } = poly;
    const missing = [];
    features.forEach((feature) => {
      if (!window[feature]) {
        window[feature] = true;
        missing.push(feature);
      }
    });

    // Run the test
    poly((error) => {
      expect(error).toBeUndefined();
      // Remove those added "features" from the window object to return
      // it to its previous state
      missing.forEach(m => delete window[m]);
      done();
    });
  });
});
