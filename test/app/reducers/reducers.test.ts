export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const seamless = require('seamless-immutable').static;
const rootReducer = require('../../../app/reducers');
const { actionFunc } = require('../../../app/actions');


describe('/app/reducers', () => {
  test('should reduce a logout success', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutSuccess());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout request', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutRequest());
    expect(actual).toMatchSnapshot();
  });

  test('should reduce a logout failure', () => {
    const actual = rootReducer(seamless({}), actionFunc.logoutFailure());
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