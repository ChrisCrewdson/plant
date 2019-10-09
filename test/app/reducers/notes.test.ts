import si from 'seamless-immutable';
import { notes } from '../../../app/reducers/notes';
import { actionFunc } from '../../../app/actions';

// @ts-ignore
const seamless = si.static;

function checkReducer(
  actionName: string, state: any, payload: string | object | undefined | any[], expected: any) {
  const action = actionFunc[actionName](payload);
  const actual = notes(state, action);
  expect(actual).toEqual(expected);
}

describe('/app/reducers/notes', () => {
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

    test('should upsertNoteRequestSuccess with missing note in action', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } });
      const payload = { };
      const expected = state;
      checkReducer('upsertNoteSuccess', state, payload, expected);
    });

    test('should delete note', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } });
      const payload = 'id1';
      const expected = seamless.from({});
      checkReducer('deleteNoteRequest', state, payload, expected);
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

    test('should loadNotesSuccess with empty payload', () => {
      const state = seamless.from({ id1: { _id: 'id1', date: 20160101 } });
      const payload: any[] = [];
      const expected = state;
      checkReducer('loadNotesSuccess', state, payload, expected);
    });
  });
});
