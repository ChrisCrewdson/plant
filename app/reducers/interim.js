// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

const omit = require('lodash/omit');
const actions = require('../actions');

// action.payload:
// {note, plant}
function editNoteOpen(state, action) {
  const note = Object.freeze(action.payload);
  return Object.freeze({
    ...state,
    note
  });
}

// action.payload:
// Empty
function editNoteClose(state) {
  // Just remove note element if editing is canceled
  // or if the note has been saved
  return Object.freeze(omit(state, ['note']));
}

// action.payload:
// {note-key: note-value, ...}
// state:
//   note:
//     note,
//     plant
function editNoteChange(state, action) {
  const note = Object.freeze({
    ...state.note.note,
    ...action.payload
  });

  return Object.freeze({
    ...state,
    note: {
      note,
      plant: state.note.plant
    }
  });
}

const reducers = {
  // Init the note prop in the interim state with something
  // so that the note is editable
  [actions.EDIT_NOTE_OPEN]: editNoteOpen,
  [actions.EDIT_NOTE_CHANGE]: editNoteChange,
  [actions.EDIT_NOTE_CLOSE]: editNoteClose
};

module.exports = (state = {}, action) => {
  if(reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

module.exports.reducers = reducers;

/*
This state is WIP
{
  note: {
    note: {
      id: 'some-mongo-id',
      mode: 'new/update',
      fileUploadStatus: 'some string percent or object ??'
    },
    plant: {
      // expected props for a plant
    }
  }
}
*/
