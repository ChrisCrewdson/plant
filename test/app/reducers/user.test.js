const user = require('../../../app/reducers/user');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

function checkReducer(actionName, state, payload, expected) {
  const action = actions[actionName](payload);
  const actual = user(state, action);
  // The following line provides useful debug info which the one after does not
  expect(actual).toEqual(expected);
  // TODO: Can a snapshot check be put in here because the caller is the test?
  expect(actual).toBe(expected);
}

describe('/app/reducers/user', () => {
  test('should reduce a logout action', () => {
    const state = seamless.from({});
    const payload = {};
    const expected = seamless.from({});
    checkReducer('logout', state, payload, expected);
  });

  test('should reduce a login request', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };
    const expected = seamless.from({
      status: 'fetching',
    });
    checkReducer('loginRequest', state, payload, expected);
  });

  test('should reduce a login success', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };
    const expected = seamless.from(Object.assign(
      {}, {
        status: 'success',
        isLoggedIn: true,
      },
      payload,
    ));
    checkReducer('loginSuccess', state, payload, expected);
  });

  test('should reduce a login failure', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };
    const expected = seamless.from(Object.assign(
      {}, {
        status: 'failed',
        isLoggedIn: false,
      },
      payload,
    ));
    checkReducer('loginFailure', state, payload, expected);
  });
});
