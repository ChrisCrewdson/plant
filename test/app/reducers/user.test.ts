import { produce } from 'immer';
import { user } from '../../../app/reducers/user';
import { actionFunc } from '../../../app/actions';

function checkReducer(actionName: string, state: any, payload?: object) {
  const action = actionFunc[actionName](payload);
  const actual = user(state, action);

  expect(actual).toMatchSnapshot();
}

describe('/app/reducers/user', () => {
  test('should reduce a logout request', () => {
    const state = produce({}, (draft) => draft);
    const payload = {};

    checkReducer('logoutRequest', state, payload);
  });

  test('should reduce a logout success', () => {
    const state = produce({}, (draft) => draft);
    const payload = {};

    checkReducer('logoutSuccess', state, payload);
  });

  test('should reduce a logout failure', () => {
    const state = produce({}, (draft) => draft);
    const payload = {};

    checkReducer('logoutFailure', state, payload);
  });

  test('should reduce a loadLocationsSuccess', () => {
    const state = produce({
      _id: 'u-1',
      isLoggedIn: true,
      activeLocationId: false,
    }, (draft) => draft);

    const payload = [{
      members: {
        'u-1': true,
      },
      _id: 'l-1',
    }];

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should reduce a missing location', () => {
    const state = produce({
      _id: 'u-1',
      isLoggedIn: true,
      activeLocationId: false,
    }, (draft) => draft);

    const payload = [{
      members: {
        'u-2': true,
      },
      _id: 'l-1',
    }];

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should not change state with loadLocationsSuccess when not logged in', () => {
    const state = produce({
      _id: 'u-1',
      isLoggedIn: false,
      activeLocationId: false,
    }, (draft) => draft);

    const payload = undefined;

    checkReducer('loadLocationsSuccess', state, payload);
  });

  test('should handle changeActiveLocationId', () => {
    const state = produce({
      activeLocationId: 'l-2',
    }, (draft) => draft);

    const payload = {
      _id: 'l-1',
    };

    checkReducer('changeActiveLocationId', state, payload);
  });

  test('should handle changeActiveLocationId with no payload', () => {
    const state = produce({
      activeLocationId: 'l-2',
    }, (draft) => draft);

    const payload = undefined;

    checkReducer('changeActiveLocationId', state, payload);
  });
});
