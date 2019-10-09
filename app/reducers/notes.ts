import { AnyAction } from 'redux';
import si from 'seamless-immutable';
import { actionEnum } from '../actions';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

// @ts-ignore
const seamless = si.static;

/**
 * Raised when a save event is triggered for a note.
 */
function upsertNoteRequestSuccess(state: UiNotes, action: AnyAction): UiNotes {
  const { _id = '' } = action.payload.note || {};
  if (!_id) {
    return state;
  }
  return seamless.set(state, _id, action.payload.note);
}

/**
 * @param action - action.payload holds _id of note being deleted
 */
function deleteNoteRequest(state: UiNotes, action: AnyAction): UiNotes {
  const { payload: _id } = action;
  return seamless.without(state, _id);
}


/**
 * @param action - action.payload is an array of notes from the server
 */
function loadNotesSuccess(state: UiNotes, { payload: notes }: AnyAction): UiNotes {
  if (notes && notes.length) {
    const newNotes = notes.reduce(
      (acc: UiNotes, note: UiNotesValue) => {
        acc[note._id] = note;
        return acc;
      }, {});

    return seamless.merge(state, newNotes);
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

  const updatedNotes = notes.reduce(
    (acc: UiNotes, note: UiNotesValue) => {
      acc[note._id] = { ...note, showImages: true };
      return acc;
    }, {});

  return seamless.merge(state, updatedNotes);
}

const reducers = seamless.from({
  [actionEnum.UPSERT_NOTE_REQUEST]: upsertNoteRequestSuccess,
  [actionEnum.UPSERT_NOTE_SUCCESS]: upsertNoteRequestSuccess,

  [actionEnum.SHOW_NOTE_IMAGES]: showNoteImages,

  [actionEnum.DELETE_NOTE_REQUEST]: deleteNoteRequest,

  [actionEnum.LOAD_NOTES_SUCCESS]: loadNotesSuccess,

});

module.exports = (state: UiNotes = {}, action: AnyAction): UiNotes => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
