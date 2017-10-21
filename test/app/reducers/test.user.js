const user = require('../../../app/reducers/user');
const actions = require('../../../app/actions');
const assert = require('assert');
const Immutable = require('immutable');

function checkReducer(actionName, state, payload, expected) {
  const action = actions[actionName](payload);
  const actual = user(state, action);
  // The following line provides useful debug info which the one after does not
  assert.deepEqual(actual.toJS(), expected.toJS());
  assert(Immutable.is(actual, expected));
}

describe('/app/reducers/user', () => {
  it('should reduce a logout action', () => {
    const state = Immutable.fromJS({});
    const payload = {};
    const expected = Immutable.fromJS({});
    checkReducer('logout', state, payload, expected);
  });

  it('should reduce a login request', () => {
    const state = Immutable.fromJS({});
    const payload = { one: 1, two: 2 };
    const expected = Immutable.fromJS({
      status: 'fetching',
    });
    checkReducer('loginRequest', state, payload, expected);
  });

  it('should reduce a login success', () => {
    const state = Immutable.fromJS({});
    const payload = { one: 1, two: 2 };
    const expected = Immutable.fromJS(Object.assign(
      {}, {
        status: 'success',
        isLoggedIn: true,
      },
      payload,
    ));
    checkReducer('loginSuccess', state, payload, expected);
  });

  it('should reduce a login failure', () => {
    const state = Immutable.fromJS({});
    const payload = { one: 1, two: 2 };
    const expected = Immutable.fromJS(Object.assign(
      {}, {
        status: 'failed',
        isLoggedIn: false,
      },
      payload,
    ));
    checkReducer('loginFailure', state, payload, expected);
  });
});
