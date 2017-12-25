const notes = require('../../../app/reducers/notes');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

describe('/app/reducers/notes', () => {
  describe('sanity check', () => {
    test('should check that all the reducers are in the actions file', () => {
      Object.keys(notes.reducers).forEach((reducerKey) => {
        // If any of the actions being used in the reducer haven't been defined
        // in the actions file then this test will fail.
        expect(reducerKey).not.toBe('undefined');
      });
    });
  });

  function checkReducer(actionName, state, payload, expected) {
    const action = actions[actionName](payload);
    const actual = notes(state, action);
    expect(actual.toJS()).toEqual(expected.toJS());
  }

  describe('reduction', () => {
    test('should upsertNoteRequestSuccess', () => {
      const state = Immutable.fromJS({ id1: { _id: 'id1', date: 20160101 } });
      const payload = { note: { _id: 'id2', date: 20160202 } };
      const expected = Immutable.fromJS({
        id1: { _id: 'id1', date: 20160101 },
        id2: { _id: 'id2', date: 20160202 },
      });
      checkReducer('upsertNoteSuccess', state, payload, expected);
      checkReducer('upsertNoteRequest', state, payload, expected);
    });

    test('should upsertNoteRequestSuccess with plantIds', () => {
      const state = Immutable.fromJS({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } });
      const payload = { note: { _id: 'id1', date: 20160202, plantIds: ['p2', 'p3'] } };
      const expected = Immutable.fromJS({
        id1: payload.note,
      });
      checkReducer('upsertNoteSuccess', state, payload, expected);
    });

    test('should loadNotesSuccess', () => {
      const state = Immutable.fromJS({ id1: { _id: 'id1', date: 20160101 } });
      const payload = [{ _id: 'id2', date: 20160202 }, { _id: 'id3', date: 20160303 }];
      const expected = Immutable.fromJS({
        id1: { _id: 'id1', date: 20160101 },
        id2: { _id: 'id2', date: 20160202 },
        id3: { _id: 'id3', date: 20160303 },
      });
      checkReducer('loadNotesSuccess', state, payload, expected);
    });
  });
});
