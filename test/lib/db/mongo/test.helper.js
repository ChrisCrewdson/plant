const Helper = require('../../../../lib/db/mongo/helper');
const assert = require('assert');

const logger = require('../../../../lib/logging/logger').create('test.mongo-helper');

describe('/lib/db/mongo/helper', () => {
  describe('removeEmtpy', () => {
    test('should remove empty string values', () => {
      const doc = {
        one: 'one',
        two: '',
        three: 0,
        four: false,
      };
      const rDoc = Helper.removeEmpty(doc);
      logger.trace('rDoc:', { rDoc });
      assert.deepEqual(rDoc, {
        one: 'one',
        three: 0,
        four: false,
      });
    });
  });
});
