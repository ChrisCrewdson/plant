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

  test('should reduce a loadLocationsSuccess', () => {
    const state = seamless.from({
      _id: 'u-1',
      isLoggedIn: true,
      activeLocationId: false,
    });

    const payload = [{
      members: {
        'u-1': true,
      },
      _id: 'l-1',
    }];

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should reduce a missing location', () => {
    const state = seamless.from({
      _id: 'u-1',
      isLoggedIn: true,
      activeLocationId: false,
    });

    const payload = [{
      members: {
        'u-2': true,
      },
      _id: 'l-1',
    }];

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should not change state with loadLocationsSuccess when not logged in', () => {
    const state = seamless.from({
      _id: 'u-1',
      isLoggedIn: false,
      activeLocationId: false,
    });

    const payload = undefined;

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should handle changeActiveLocationId', () => {
    const state = seamless.from({
      activeLocationId: 'l-2',
    });

    const payload = {
      _id: 'l-1',
    };

    checkReducer('changeActiveLocationId', state, payload);
  });

  test('should handle changeActiveLocationId with no payload', () => {
    const state = seamless.from({
      activeLocationId: 'l-2',
    });

    const payload = undefined;

    checkReducer('changeActiveLocationId', state, payload);
  });
});
