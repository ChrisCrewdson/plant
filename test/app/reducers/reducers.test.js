// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const rootReducer = require('../../../app/reducers');
const actions = require('../../../app/actions');


describe('/app/reducers', () => {
  test('should reduce a logout success', () => {
    const actual = rootReducer(seamless({}), actions.logoutSuccess());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout request', () => {
    const actual = rootReducer(seamless({}), actions.logoutRequest());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout failure', () => {
    const actual = rootReducer(seamless({}), actions.logoutFailure());
    expect(actual).toMatchSnapshot();
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
