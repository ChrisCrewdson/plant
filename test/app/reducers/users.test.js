const users = require('../../../app/reducers/users');
const actions = require('../../../app/actions');

const seamless = require('seamless-immutable').static;

function checkReducer(actionName, state, payload, expected) {
  const action = actions[actionName](payload);
  const actual = users(state, action);
  // The following line provides useful debug info which the one after does not
  expect(actual).toEqual(expected);
  // TODO: See comment in user.test.js
  expect(actual).toBe(expected);
}

describe('/app/reducers/users', () => {
  test('should reduce loadUserSuccess action', () => {
    const state = seamless.from({});
    const payload = { _id: '1', name: 'john' };
    const expected = seamless.from({
      1: { _id: '1', name: 'john', locationIds: [] },
    });
    checkReducer('loadUserSuccess', state, payload, expected);
  });

  test('should reduce loadUsersSuccess action', () => {
    const state = seamless.from({});
    const payload = [{ _id: '1', name: 'john' }];
    const expected = seamless.from({
      1: { _id: '1', name: 'john', locationIds: [] },
    });
    checkReducer('loadUsersSuccess', state, payload, expected);
  });

  test('should reduce createPlantRequest action', () => {
    const state = seamless.from({ u1: { _id: 'u1', name: 'john', locationIds: ['p1'] } });
    const payload = { _id: 'p2', title: 'pt', userId: 'u1' };
    const expected = seamless.from({
      u1: { _id: 'u1', name: 'john', locationIds: ['p1'] },
    });
    checkReducer('createPlantRequest', state, payload, expected);
  });

  test('should reduce loadPlantsSuccess action', () => {
    const state = seamless.from({
      u1: {
        _id: 'u1',
        name: 'john',
        locationIds: ['p1.1'],
      },
      u2: {
        _id: 'u2',
        name: 'jane',
        locationIds: ['p2.1', 'p2.2'],
      },
    });
    const payload = [
      { _id: 'p1.1', userId: 'u1' },
      { _id: 'p1.2', userId: 'u1' },
      { _id: 'p2.2', userId: 'u2' },
      { _id: 'p2.3', userId: 'u2' },
      { _id: 'p3.1', userId: 'u3' },
    ];
    const expected = seamless.from({
      u1: { _id: 'u1', name: 'john', locationIds: ['p1.1'] },
      u2: { _id: 'u2', name: 'jane', locationIds: ['p2.1', 'p2.2'] },
    });
    checkReducer('loadPlantsSuccess', state, payload, expected);
  });

  test('should delete a plant', () => {
    const state = seamless.from({
      l1: {
        _id: 'l1',
        name: 'john',
        locationIds: ['p1.1'],
      },
      l2: {
        _id: 'l2',
        name: 'jane',
        locationIds: ['p2.1', 'p2.2', 'p2.3'],
      },
    });
    const payload = { locationId: 'l2', plantId: 'p2.1' };
    const expected = seamless.from({
      l1: { _id: 'l1', name: 'john', locationIds: ['p1.1'] },
      l2: { _id: 'l2', name: 'jane', locationIds: ['p2.1', 'p2.2', 'p2.3'] },
    });

    checkReducer('deletePlantRequest', state, payload, expected);
  });
});
