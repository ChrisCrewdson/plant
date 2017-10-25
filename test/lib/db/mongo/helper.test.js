const Helper = require('../../../../lib/db/mongo/helper');

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
      expect(rDoc).toEqual({
        one: 'one',
        three: 0,
        four: false,
      });
    });
  });
});
