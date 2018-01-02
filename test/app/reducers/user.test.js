const user = require('../../../app/reducers/user');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

function checkReducer(actionName, state, payload) {
  const action = actions[actionName](payload);
  const actual = user(state, action);

  expect(actual).toMatchSnapshot();
}

describe('/app/reducers/user', () => {
  test('should reduce a logout action', () => {
    const state = seamless.from({});
    const payload = {};

    checkReducer('logout', state, payload);
  });

  test('should reduce a login request', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };

    checkReducer('loginRequest', state, payload);
  });

  test('should reduce a login success', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };

    checkReducer('loginSuccess', state, payload);
  });

  test('should reduce a login failure', () => {
    const state = seamless.from({});
    const payload = { one: 1, two: 2 };

    checkReducer('loginFailure', state, payload);
  });
});
