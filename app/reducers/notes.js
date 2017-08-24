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
    userId: 'mongoId - identifies user'
  }
}
*/

const actions = require('../actions');
const Immutable = require('immutable');

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
  return state.set(_id, Immutable.fromJS(action.payload.note));
}

/**
 *
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload holds new note
 * @returns {object} state - the new object of notes
 */
function upsertNoteFailure(state) {
  return state;
}

/**
 *
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload holds _id of note being deleted
 * @returns {object} state - the new object of notes
 */
function deleteNoteRequest(state, action) {
  return state.delete(action.payload);
}

/**
 *
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload holds new note
 * @returns {object} state - the new object of notes
 */
function deleteNoteSuccess(state /* , action */) {
  return state;
}

/**
 *
 * @param {object} state - existing object of notes
 * @param {object} action - action.payload holds new note
 * @returns {object} state - the new object of notes
 */
function deleteNoteFailure(state /* , action */) {
  return state;
}

// action.payload is an array of notes from the server
function loadNotesSuccess(state, action) {
  const notes = action.payload;
  if (notes && notes.length) {
    const newNotes = notes.reduce((acc, note) => {
      acc[note._id] = note;
      return acc;
    }, {});

    return state.mergeDeep(newNotes);
  }
  // console.warn('Nothing loaded from server in loadNotesSuccess:', action);
  return state;
}

const reducers = Object.freeze({
  [actions.UPSERT_NOTE_REQUEST]: upsertNoteRequestSuccess,
  [actions.UPSERT_NOTE_SUCCESS]: upsertNoteRequestSuccess,
  [actions.UPSERT_NOTE_FAILURE]: upsertNoteFailure,

  [actions.DELETE_NOTE_REQUEST]: deleteNoteRequest,
  [actions.DELETE_NOTE_SUCCESS]: deleteNoteSuccess,
  [actions.DELETE_NOTE_FAILURE]: deleteNoteFailure,

  [actions.LOAD_NOTES_SUCCESS]: loadNotesSuccess,

});

if (reducers.undefined) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing action type in notes.js - these are the reducers keys:
${Object.keys(reducers).join()}`);
}

module.exports = (state = new Immutable.Map(), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

module.exports.reducers = reducers;
