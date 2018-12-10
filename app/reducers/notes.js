

// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const { actionEnum } = require('../actions');

/**
 * Raised when a save event is triggered for a note.
 * @param {UiNotes} state
 * @param {import('redux').AnyAction} action
 * @returns {UiNotes} state
 */
function upsertNoteRequestSuccess(state, action) {
  const { _id = '' } = action.payload.note || {};
  if (!_id) {
    // console.error('No _id in note in upsertNoteRequestSuccess', action.payload);
    return state;
  }
  return seamless.set(state, _id, action.payload.note);
}

/**
 *
 * @param {UiNotes} state
 * @param {import('redux').AnyAction} action - action.payload holds _id of note being deleted
 * @returns {UiNotes} state
 */
function deleteNoteRequest(state, action) {
  const { payload: _id } = action;
  return seamless.without(state, _id);
}


/**
 *
 * @param {UiNotes} state
 * @param {import('redux').AnyAction} action - action.payload is an array of notes from the server
 * @returns {UiNotes} state
 */
function loadNotesSuccess(state, { payload: notes }) {
  if (notes && notes.length) {
    const newNotes = notes.reduce(
      /**
       * @param {UiNotes} acc
       * @param {UiNotesValue} note
       */
      (acc, note) => {
        acc[note._id] = note;
        return acc;
      }, {});

    return seamless.merge(state, newNotes);
  }

  return state;
}


/**
 *
 * @param {UiNotes} state
 * @param {import('redux').AnyAction} action - action.payload is the _id of the note whose
 *                                             images we are going to tag as showable
 * @returns {UiNotes} state
 */
function showNoteImages(state, { payload: _id }) {
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
    /**
     * @param {UiNotes} acc
     * @param {UiNotesValue} note
     */
    (acc, note) => {
      acc[note._id] = Object.assign({}, note, { showImages: true });
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

/**
 *
 * @param {UiNotes} state
 * @param {import('redux').AnyAction} action
 * @returns {UiNotes}
 */
module.exports = (state = {}, action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
