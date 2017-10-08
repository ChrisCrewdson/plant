const rootReducer = require('../../../app/reducers');
const actions = require('../../../app/actions');
const assert = require('assert');
const Immutable = require('immutable');

describe('/app/reducers', () => {
  test('should reduce a logout action', (done) => {
    const expected = {
      interim: {},
      locations: {},
      notes: {},
      plants: {},
      user: {},
      users: {},
    };
    const actual = rootReducer(new Immutable.Map(), actions.logout());
    assert.deepEqual(actual.toJS(), expected);
    done();
  });
});
