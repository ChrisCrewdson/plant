const Helper = require('../../../../lib/db/mongo/helper');

describe('/lib/db/mongo/helper', () => {
  describe('removeEmpty', () => {
    test('should remove empty string values', () => {
      const doc = {
        one: 'one',
        two: '',
        three: 0,
        four: false,
      };
      const rDoc = Helper.removeEmpty(doc);

      expect(rDoc).toEqual({
        one: 'one',
        three: 0,
        four: false,
      });
    });

    test('should remove empty string values from array', () => {
      const doc = [{
        one: 'one',
        two: '',
        three: 0,
        four: false,
      }, {
        one: 'one',
        two: '',
        three: 0,
        four: false,
      }];
      const rDoc = Helper.removeEmpty(doc);

      expect(rDoc).toEqual([{
        one: 'one',
        three: 0,
        four: false,
      }, {
        one: 'one',
        three: 0,
        four: false,
      }]);
    });

    test('should do nothing if param is falsy', () => {
      const rDoc = Helper.removeEmpty();
      expect(rDoc).toBeUndefined();
    });
  });
});
