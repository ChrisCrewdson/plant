// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

const seamless = require('seamless-immutable').static;
const actions = require('../actions');

// action.payload:
// {note, plant}
function editNoteOpen(state, action) {
  return seamless.set(state, 'note', action.payload);
}

// action.payload:
// Empty
function editNoteClose(state) {
  // Just remove note element if editing is canceled
  // or if the note has been saved
  return seamless.without(state, 'note');
}

// action.payload:
// {note-key: note-value, ...}
// state:
//   note:
//     note,
//     plant
function editNoteChange(state, action) {
  return seamless.merge(state, { note: { note: action.payload } }, { deep: true });
}

// action.payload:
// {plant}
function editPlantOpen(state, { payload }) {
  let { plant = {} } = payload;
  if (Object.prototype.hasOwnProperty.call(plant, 'price')) {
    plant = seamless.asMutable(plant, { deep: true });
    plant.price = plant.price.toString();
  }

  return seamless.set(state, 'plant', { plant });
}

// action.payload:
// Empty
function editPlantClose(state) {
  // Just remove plant element if editing is canceled
  // or if the plant has been saved
  return seamless.without(state, 'plant');
}

// action.payload:
// {plant-key: plant-value, ...}
// state:
//   plant:
//     plant
function editPlantChange(state, action) {
  return seamless.merge(state, { plant: { plant: action.payload } }, { deep: true });
}

function loadPlantsRequest(state, action) {
  return seamless.set(state, 'loadPlantRequest', action.payload);
}

function loadPlantsSuccess(state) {
  return seamless.without(state, 'loadPlantRequest');
}

function loadPlantsFailure(state) {
  return seamless.without(state, 'loadPlantRequest');
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
  [actions.LOAD_PLANTS_REQUEST]: loadPlantsRequest,
  [actions.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.LOAD_PLANTS_FAILURE]: loadPlantsFailure,
};

module.exports = (state = seamless({}), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
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
