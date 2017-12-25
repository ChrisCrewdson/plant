const rootReducer = require('../../../app/reducers');
const actions = require('../../../app/actions');

const seamless = require('seamless-immutable').static;

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
});
