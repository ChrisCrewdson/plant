// To get around: Cannot redeclare block-scoped variable .ts(2451)

import si from 'seamless-immutable';

// @ts-ignore
const seamless = si.static;

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
      // @ts-ignore - intentionally mistyped for testing
      const rDoc = Helper.removeEmpty();
      expect(rDoc).toBeUndefined();
    });
  });

  describe('convertIdToString', () => {
    test('should return object if no _id prop', () => {
      const obj = seamless.from({});
      const actual = Helper.convertIdToString(obj);
      expect(actual).toBe(obj);
    });
  });
});
