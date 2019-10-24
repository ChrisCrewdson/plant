import { produce } from 'immer';
import { users } from '../../../app/reducers/users';
import { actionFunc } from '../../../app/actions';

function checkReducer(actionName: string, state: any, payload?: object) {
  const action = actionFunc[actionName](payload);
  const actual = users(state, action);

  expect(actual).toMatchSnapshot();
}

describe('/app/reducers/users', () => {
  test('should reduce loadUserSuccess action', () => {
    const state = produce({}, (draft) => draft);
    const payload = { _id: '1', name: 'john' };

    checkReducer('loadUserSuccess', state, payload);
  });

  test('should reduce loadUsersSuccess action', () => {
    const state = produce({}, (draft) => draft);
    const payload = [{ _id: '1', name: 'john' }];

    checkReducer('loadUsersSuccess', state, payload);
  });

  test('should reduce loadUsersSuccess with undefined payload', () => {
    const state = produce({}, (draft) => draft);
    const payload = undefined;

    checkReducer('loadUsersSuccess', state, payload);
  });

  test('should reduce createPlantRequest action', () => {
    const state = produce({ u1: { _id: 'u1', name: 'john', locationIds: ['p1'] } }, (draft) => draft);
    const payload = { _id: 'p2', title: 'pt', userId: 'u1' };

    checkReducer('createPlantRequest', state, payload);
  });

  test('should reduce loadPlantsSuccess action', () => {
    const state = produce({
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
    }, (draft) => draft);
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
    const state = produce({
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
    }, (draft) => draft);
    const payload = { locationId: 'l2', plantId: 'p2.1' };

    checkReducer('deletePlantRequest', state, payload);
  });
});
