
import { produce } from 'immer';
import { ObjectID } from 'bson';
import { Helper } from '../../../../lib/db/mongo/helper';

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
      let doc: any;
      const rDoc = Helper.removeEmpty(doc);
      expect(rDoc).toBeUndefined();
    });
  });

  describe('convertIdToString', () => {
    test('should return object if immutable', () => {
      const obj = produce({ _id: new ObjectID() } as DbUser, (draft) => draft);
      const actual = Helper.convertIdToString(obj);
      expect(actual._id).toBe(obj._id.toString());
    });
  });
});
