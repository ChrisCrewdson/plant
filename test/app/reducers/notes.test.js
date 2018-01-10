const notes = require('../../../app/reducers/notes');
const actions = require('../../../app/actions');
const seamless = require('seamless-immutable').static;

describe('/app/reducers/notes', () => {
  function checkReducer(actionName, state, payload, expected) {
    const action = actions[actionName](payload);
    const actual = notes(state, action);
    expect(actual).toEqual(expected);
  }

  describe('reduction', () => {
    test('should upsertNoteRequestSuccess', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101 } });
      const payload = { note: { _id: 'id2', date: 20160202 } };
      const expected = seamless.from({
        id1: { _id: 'id1', date: 20160101 },
        id2: { _id: 'id2', date: 20160202 },
      });
      checkReducer('upsertNoteSuccess', state, payload, expected);
      checkReducer('upsertNoteRequest', state, payload, expected);
    });

    test('should upsertNoteRequestSuccess with plantIds', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } });
      const payload = { note: { _id: 'id1', date: 20160202, plantIds: ['p2', 'p3'] } };
      const expected = seamless.from({
        id1: payload.note,
      });
      checkReducer('upsertNoteSuccess', state, payload, expected);
    });

    test('should loadNotesSuccess', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101 } });
      const payload = [{ _id: 'id2', date: 20160202 }, { _id: 'id3', date: 20160303 }];
      const expected = seamless.from({
        id1: { _id: 'id1', date: 20160101 },
        id2: { _id: 'id2', date: 20160202 },
        id3: { _id: 'id3', date: 20160303 },
      });
      checkReducer('loadNotesSuccess', state, payload, expected);
    });
  });
});
