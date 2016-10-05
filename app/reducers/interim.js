// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

const actions = require('../actions');
const Immutable = require('immutable');

// action.payload:
// {note, plant}
function editNoteOpen(state, action) {
  return state.set('note', Immutable.fromJS(action.payload));
}

// action.payload:
// Empty
function editNoteClose(state) {
  // Just remove note element if editing is canceled
  // or if the note has been saved
  return state.delete('note');
}

// action.payload:
// {note-key: note-value, ...}
// state:
//   note:
//     note,
//     plant
function editNoteChange(state, action) {
  return state.mergeDeep({note: {note: action.payload}});
}

// action.payload:
// {plant}
function editPlantOpen(state, action) {
  return state.set('plant', Immutable.fromJS(action.payload));
}

// action.payload:
// Empty
function editPlantClose(state) {
  // Just remove plant element if editing is canceled
  // or if the plant has been saved
  return state.delete('plant');
}

// action.payload:
// {plant-key: plant-value, ...}
// state:
//   plant:
//     plant,
//     plant
function editPlantChange(state, action) {
  return state.mergeDeep({plant: {plant: action.payload}});
}

const reducers = {
  // Init the note prop in the interim state with something
  // so that the note is editable
  [actions.EDIT_NOTE_OPEN]: editNoteOpen,
  [actions.EDIT_NOTE_CHANGE]: editNoteChange,
  [actions.EDIT_NOTE_CLOSE]: editNoteClose,
  [actions.EDIT_PLANT_OPEN]: editPlantOpen,
  [actions.EDIT_PLANT_CHANGE]: editPlantChange,
  [actions.EDIT_PLANT_CLOSE]: editPlantClose,
};

module.exports = (state = new Immutable.Map(), action) => {
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
