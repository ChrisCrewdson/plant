import { AnyAction } from 'redux';
import { produce } from 'immer';
import { actionEnum } from '../actions';

/**
 * Raised when a save event is triggered for a note.
 */
function upsertNoteRequestSuccess(state: UiNotes, action: AnyAction): UiNotes {
  const { _id = '' } = action.payload.note || {};
  if (!_id) {
    return state;
  }

  return produce(state, (draft) => {
    draft[_id] = action.payload.note;
  });
}

/**
 * @param action - action.payload holds _id of note being deleted
 */
function deleteNoteRequest(state: UiNotes, action: AnyAction): UiNotes {
  const { payload: _id } = action;
  return produce(state, (draft) => {
    delete draft[_id];
  });
}


/**
 * @param action - action.payload is an array of notes from the server
 */
function loadNotesSuccess(state: UiNotes, { payload: notes }: AnyAction): UiNotes {
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
function showNoteImages(state: UiNotes, { payload: _id }: AnyAction): UiNotes {
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
  [actionEnum.UPSERT_NOTE_REQUEST]: upsertNoteRequestSuccess,
  [actionEnum.UPSERT_NOTE_SUCCESS]: upsertNoteRequestSuccess,

  [actionEnum.SHOW_NOTE_IMAGES]: showNoteImages,

  [actionEnum.DELETE_NOTE_REQUEST]: deleteNoteRequest,

  [actionEnum.LOAD_NOTES_SUCCESS]: loadNotesSuccess,

} as Readonly<Record<string, (state: UiNotes, action: AnyAction) => UiNotes>>;

export const notes = (state: UiNotes = {}, action: AnyAction): UiNotes => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
