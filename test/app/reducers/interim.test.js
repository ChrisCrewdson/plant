const interim = require('../../../app/reducers/interim');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

describe('/app/reducers/interim', () => {
  function checkReducer(actionName, state, payload, expected) {
    const action = actions[actionName](payload);
    const actual = interim(state, action);

    expect(actual).toEqual(expected);
  }

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
});
