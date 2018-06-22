const seamless = require('seamless-immutable').static;
const users = require('../../../app/reducers/users');
const actions = require('../../../app/actions');


function checkReducer(actionName, state, payload) {
  const action = actions[actionName](payload);
  const actual = users(state, action);

  expect(actual).toMatchSnapshot();
}

describe('/app/reducers/users', () => {
  test('should reduce loadUserSuccess action', () => {
    const state = seamless.from({});
    const payload = { _id: '1', name: 'john' };

    checkReducer('loadUserSuccess', state, payload);
  });

  test('should reduce loadUsersSuccess action', () => {
    const state = seamless.from({});
    const payload = [{ _id: '1', name: 'john' }];

    checkReducer('loadUsersSuccess', state, payload);
  });

  test('should reduce loadUsersSuccess with undefined payload', () => {
    const state = seamless.from({});
    const payload = undefined;

    checkReducer('loadUsersSuccess', state, payload);
  });

  test('should reduce createPlantRequest action', () => {
    const state = seamless.from({ u1: { _id: 'u1', name: 'john', locationIds: ['p1'] } });
    const payload = { _id: 'p2', title: 'pt', userId: 'u1' };

    checkReducer('createPlantRequest', state, payload);
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

    checkReducer('loadPlantsSuccess', state, payload);
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

    checkReducer('deletePlantRequest', state, payload);
  });
});
