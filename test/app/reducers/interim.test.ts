import si from 'seamless-immutable';

// @ts-ignore
const seamless = si.static;
const interim = require('../../../app/reducers/interim');
const { actionFunc } = require('../../../app/actions');

function checkReducer(
  actionName: string, state: any, payload: object | undefined | any[], expected: any) {
  const action = actionFunc[actionName](payload);
  const actual = interim(state, action);

  expect(actual).toEqual(expected);
}

describe('/app/reducers/interim', () => {
  describe('editNoteOpen', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({});
      const payload = {};
      const expected = seamless({ note: {} });
      checkReducer('editNoteOpen', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({});
      const payload = { a: 1, b: 2 };
      const expected = seamless({ note: { a: 1, b: 2 } });
      checkReducer('editNoteOpen', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ plant: { a: 1 } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ note: { a: 1, b: 2 }, plant: { a: 1 } });
      checkReducer('editNoteOpen', state, payload, expected);
    });
  });

  describe('editNoteClose', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({});
      const payload = {};
      const expected = seamless({});
      checkReducer('editNoteClose', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({});
      const payload = { a: 1, b: 2 };
      const expected = seamless({});
      checkReducer('editNoteClose', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ plant: { a: 1 } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ plant: { a: 1 } });
      checkReducer('editNoteClose', state, payload, expected);
    });
  });

  describe('editNoteChange', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({ note: { note: {}, plant: {} } });
      const payload = {};
      const expected = seamless({ note: { note: {}, plant: {} } });
      checkReducer('editNoteChange', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({ note: { note: {}, plant: {} } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ note: { note: { a: 1, b: 2 }, plant: {} } });
      checkReducer('editNoteChange', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ note: { note: { a: 11, c: 3 }, plant: {} } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ note: { note: { a: 1, b: 2, c: 3 }, plant: {} } });
      checkReducer('editNoteChange', state, payload, expected);
    });
  });

  describe('editPlantOpen', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({});
      const payload = {};
      const expected = seamless({ plant: { plant: {} } });
      checkReducer('editPlantOpen', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({});
      const payload = { plant: { a: 1, b: 2 } };
      const expected = seamless({ plant: { plant: { a: 1, b: 2 } } });
      checkReducer('editPlantOpen', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ note: { a: 1 } });
      const payload = { plant: { a: 1, b: 2 } };
      const expected = seamless({ plant: { plant: { a: 1, b: 2 } }, note: { a: 1 } });
      checkReducer('editPlantOpen', state, payload, expected);
    });

    test('should reduce from a number to string price', () => {
      const state = seamless({});
      const payload = { plant: { price: 1 } };
      const expected = seamless({ plant: { plant: { price: '1' } } });
      checkReducer('editPlantOpen', state, payload, expected);
    });
  });

  describe('editPlantClose', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({});
      const payload = {};
      const expected = seamless({});
      checkReducer('editPlantClose', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({});
      const payload = { a: 1, b: 2 };
      const expected = seamless({});
      checkReducer('editPlantClose', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ note: { a: 1 } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ note: { a: 1 } });
      checkReducer('editPlantClose', state, payload, expected);
    });
  });

  describe('editPlantChange', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({ plant: { plant: {}, note: {} } });
      const payload = {};
      const expected = seamless({ plant: { plant: {}, note: {} } });
      checkReducer('editPlantChange', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({ plant: { plant: {}, note: {} } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ plant: { plant: { a: 1, b: 2 }, note: {} } });
      checkReducer('editPlantChange', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ plant: { plant: { a: 11, c: 3 }, note: {} } });
      const payload = { a: 1, b: 2 };
      const expected = seamless({ plant: { plant: { a: 1, b: 2, c: 3 }, note: {} } });
      checkReducer('editPlantChange', state, payload, expected);
    });
  });

  describe('loadPlants Request/Success/Failure', () => {
    test('should reduce from empty state and empty payload', () => {
      const state = seamless({ });
      const payload = { stuff: 1 };
      const expected = seamless({ loadPlantRequest: { stuff: 1 } });
      checkReducer('loadPlantsRequest', state, payload, expected);
    });

    test('should reduce from empty state and populated payload', () => {
      const state = seamless({ loadPlantRequest: true });
      const payload = { };
      const expected = seamless({ });
      checkReducer('loadPlantsFailure', state, payload, expected);
    });

    test('should reduce from existing state and populated payload', () => {
      const state = seamless({ loadPlantRequest: true });
      const payload = { };
      const expected = seamless({ });
      checkReducer('loadPlantsSuccess', state, payload, expected);
    });
  });
});
