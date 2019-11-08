import { produce } from 'immer';
import { actionEnum } from '../actions';
import { PlantAction, UpsertNoteRequestPayload } from '../../lib/types/redux-payloads';

type RoNotes = Readonly<UiNotes>;

/**
 * Raised when a save event is triggered for a note.
 */
function upsertNoteRequestSuccess(
  state: RoNotes, action: PlantAction<UpsertNoteRequestPayload>): UiNotes {
  const { note = {} as UiInterimNote } = action.payload;
  const { _id, date, userId } = note;
  if (!_id || !date || !userId) {
    return state;
  }

  return produce(state, (draft) => {
    draft[_id] = {
      ...note,
      _id,
      date,
      userId,
    };
  });
}

const upsertNoteRequest = upsertNoteRequestSuccess;
const upsertNoteSuccess = upsertNoteRequestSuccess;

/**
 * @param action - action.payload holds _id of note being deleted
 */
function deleteNoteRequest(state: RoNotes, action: PlantAction<any>): UiNotes {
  const { payload: _id } = action;
  return produce(state, (draft) => {
    delete draft[_id];
  });
}


/**
 * @param action - action.payload is an array of notes from the server
 */
function loadNotesSuccess(state: RoNotes, action: PlantAction<any>): UiNotes {
  const { payload: notes } = action;
  if (notes && notes.length) {
    return produce(state, (draft) => {
      notes.forEach((note: UiNotesValue) => {
        draft[note._id] = note;
      });
    });
  }

  return state;
}


/**
 * @param action - action.payload is the _id of the note whose
 *                 images we are going to tag as showable
 */
function showNoteImages(state: RoNotes, action: PlantAction<any>): UiNotes {
  const { payload: _id } = action;
  const noteIds = Array.isArray(_id) ? _id : [_id];
  const notes = noteIds.reduce((acc, noteId) => {
    const note = state[noteId];
    if (note && !note.showImages) {
      acc.push(note);
    }
    return acc;
  }, []);

  if (!notes.length) {
    return state;
  }

  return produce(state, (draft) => {
    notes.forEach((note: UiNotesValue) => {
      draft[note._id].showImages = true;
    });
  });
}

// This is only exported for testing
export const reducers = {
  [actionEnum.UPSERT_NOTE_REQUEST]: upsertNoteRequest,
  [actionEnum.UPSERT_NOTE_SUCCESS]: upsertNoteSuccess,

  [actionEnum.SHOW_NOTE_IMAGES]: showNoteImages,

  [actionEnum.DELETE_NOTE_REQUEST]: deleteNoteRequest,

  [actionEnum.LOAD_NOTES_SUCCESS]: loadNotesSuccess,

} as Readonly<Record<string, (state: RoNotes, action: PlantAction<any>) => UiNotes>>;

export const notes = (state: RoNotes = {}, action: PlantAction<any>): UiNotes => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
