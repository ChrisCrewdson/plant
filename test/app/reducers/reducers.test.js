const rootReducer = require('../../../app/reducers');
const actions = require('../../../app/actions');

const Immutable = require('immutable');

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
    const actual = rootReducer(new Immutable.Map(), actions.logout());
    expect(actual.toJS()).toEqual(expected);
  });
});
