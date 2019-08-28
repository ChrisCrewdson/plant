export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const seamless = require('seamless-immutable').static;
const user = require('../../../app/reducers/user');
const { actionFunc } = require('../../../app/actions');

function checkReducer(actionName: string, state: any, payload: object | undefined) {
  const action = actionFunc[actionName](payload);
  const actual = user(state, action);

  expect(actual).toMatchSnapshot();
}

describe('/app/reducers/user', () => {
  test('should reduce a logout request', () => {
    const state = seamless.from({});
    const payload = {};

    checkReducer('logoutRequest', state, payload);
  });

  test('should reduce a logout success', () => {
    const state = seamless.from({});
    const payload = {};

    checkReducer('logoutSuccess', state, payload);
  });

  test('should reduce a logout failure', () => {
    const state = seamless.from({});
    const payload = {};

    checkReducer('logoutFailure', state, payload);
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
