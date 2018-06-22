const seamless = require('seamless-immutable').static;
const rootReducer = require('../../../app/reducers');
const actions = require('../../../app/actions');


describe('/app/reducers', () => {
  test('should reduce a logout action', () => {
    const expected = {
      interim: {},
      locations: {},
      notes: {},
      plants: {},
      user: {},
      users: {},
    };
    const actual = rootReducer(seamless({}), actions.logout());
    expect(actual).toEqual(expected);
  });

  describe('sanity check all reducers', () => {
    ['interim', 'locations', 'notes', 'plants', 'user', 'users']
      .forEach((reducer) => {
        test(`${reducer} should not have an undefined reducer`, () => {
          // eslint-disable-next-line
          const { reducers } = require(`../../../app/reducers/${reducer}`);
          expect(reducers).toBeInstanceOf(Object);
          expect(reducers.undefined).toBeUndefined();
          Object.keys(reducers).forEach((reducerKey) => {
            const value = reducers[reducerKey];
            expect(value).toBeInstanceOf(Function);
          });
        });
      });
  });
});
