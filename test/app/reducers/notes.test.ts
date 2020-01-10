import { produce } from 'immer';
import { notes } from '../../../app/reducers/notes';
import { actionFunc } from '../../../app/actions';
import { UpsertNoteRequestPayload } from '../../../lib/types/redux-payloads';
import { BizNote } from '../../../lib/db/mongo/model-note';

function checkReducer(
  actionName: string, state: any, payload: string | object | undefined | any[], expected: any) {
  const action = actionFunc[actionName](payload);
  const actual = notes(state, action);
  expect(actual).toEqual(expected);
}

describe('/app/reducers/notes', () => {
  describe('reduction', () => {
    test('should upsertNoteRequestSuccess', () => {
      const state = produce({}, () => ({ id1: { _id: 'id1', date: 20160101, userId: 'u-1' } }));
      const payload = { note: { _id: 'id2', date: 20160202, userId: 'u-1' } };
      const expected = produce({}, () => ({
        id1: { _id: 'id1', date: 20160101, userId: 'u-1' },
        id2: { _id: 'id2', date: 20160202, userId: 'u-1' },
      }));
      checkReducer('upsertNoteSuccess', state, payload, expected);
      checkReducer('upsertNoteRequest', state, payload, expected);
    });

    test('should upsertNoteSuccess with plantIds', () => {
      const state = produce({}, () => ({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } }));
      const payload: UpsertNoteRequestPayload = {
        note: {
          _id: 'id1',
          date: 20160202,
          plantIds: ['p2', 'p3'],
          userId: 'u-1',
        },
      };
      const expected = produce({}, () => ({
        id1: payload.note,
      }));
      checkReducer('upsertNoteSuccess', state, payload, expected);
    });

    test('should upsertNoteSuccess with missing note in action', () => {
      const state = produce({}, () => ({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } }));
      const payload: UpsertNoteRequestPayload = { } as any;
      const expected = state;
      checkReducer('upsertNoteSuccess', state, payload, expected);
    });

    test('should delete note', () => {
      const state = produce({}, () => ({ id1: { _id: 'id1', date: 20160101, plantIds: ['p1', 'p2'] } }));
      const payload = 'id1';
      const expected = produce({}, (draft) => draft);
      checkReducer('deleteNoteRequest', state, payload, expected);
    });

    test('should loadNotesSuccess', () => {
      const state = produce({}, () => ({
        id1: { _id: 'id1', date: 20160101 },
      }));
      const payload: ReadonlyArray<BizNote> = [
        { _id: 'id2', date: 20160202 },
        { _id: 'id3', date: 20160303 },
      ] as any;
      const expected = produce({}, () => ({
        id1: { _id: 'id1', date: 20160101 },
        id2: { _id: 'id2', date: 20160202 },
        id3: { _id: 'id3', date: 20160303 },
      }));
      checkReducer('loadNotesSuccess', state, payload, expected);
    });

    test('should loadNotesSuccess with empty payload', () => {
      const state = produce({}, () => ({ id1: { _id: 'id1', date: 20160101 } }));
      const payload: any[] = [];
      const expected = state;
      checkReducer('loadNotesSuccess', state, payload, expected);
    });
  });
});
