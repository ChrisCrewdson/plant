/*
Object of notes:
{
  <mongoId>: {
    meta: {
      // new = created in UI but not saved yet
      // saved = upsertNoteSuccess has been received
      // error = an error happened saving / validating etc.
      // deleted = ajax request to delete object not complete yet
      state: 'new',
      errors: 'an array of errors'
    },
    _id: 'mongoId - same as key'
    date: 20160101 - a number,
    note: 'string',
    plantIds: 'an array of strings',
    userId: 'mongoId - identifies user',
    showImages: true/undefined
  }
}
*/

const actions = require('../actions');
const seamless = require('seamless-immutable').static;

/**
 * Raised when a save event is triggered for a note.
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload.note holds new note
 * @returns {object} state - the new object of notes
 */
function upsertNoteRequestSuccess(state, action) {
  const { _id } = action.payload.note || {};
  if (!_id) {
    // console.error('No _id in note in upsertNoteRequestSuccess', action.payload);
    return state;
  }
  return seamless.set(state, _id, action.payload.note);
}

/**
 *
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload holds _id of note being deleted
 * @returns {object} state - the new object of notes
 */
function deleteNoteRequest(state, { payload: _id }) {
  return seamless.without(state, _id);
}

// action.payload is an array of notes from the server
function loadNotesSuccess(state, { payload: notes }) {
  if (notes && notes.length) {
    const newNotes = notes.reduce((acc, note) => {
      acc[note._id] = note;
      return acc;
    }, {});

    return seamless.merge(state, newNotes);
  }
  // console.warn('Nothing loaded from server in loadNotesSuccess:', action);
  return state;
}

// action.payload is the _id of the note whose images we
// are going to tag as showable
function showNoteImages(state, { payload: _id }) {
  const note = _id && state[_id];
  if (!note || note.showImages) {
    return state;
  }

  const updatedNote = Object.assign({}, note, { showImages: true });

  return seamless.set(state, _id, updatedNote);
}

const reducers = Object.freeze({
  [actions.UPSERT_NOTE_REQUEST]: upsertNoteRequestSuccess,
  [actions.UPSERT_NOTE_SUCCESS]: upsertNoteRequestSuccess,

  [actions.SHOW_NOTE_IMAGES]: showNoteImages,

  [actions.DELETE_NOTE_REQUEST]: deleteNoteRequest,

  [actions.LOAD_NOTES_SUCCESS]: loadNotesSuccess,

});

module.exports = (state = {}, action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
