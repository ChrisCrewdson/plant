// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

import { AnyAction } from 'redux';
import { actionEnum } from '../actions';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const seamless = require('seamless-immutable').static;

function editNoteOpen(state: UiInterim, action: AnyAction): UiInterim {
//  * @param {UiNotesValue} action.payload
  return seamless.set(state, 'note', action.payload);
}

function editNoteClose(state: UiInterim): UiInterim {
  // Just remove note element if editing is canceled
  // or if the note has been saved
  return seamless.without(state, 'note');
}

/**
 * editNoteChange
 * action.payload:
 * {note-key: note-value, ...}
 * state:
 *   note:
 *     note,
 *     plant
 */
function editNoteChange(state: UiInterim, action: AnyAction): UiInterim {
//  * @param {UiNotesValue} action.payload
  return seamless.merge(state, { note: { note: action.payload } }, { deep: true });
}

// action.payload:
// {plant}
function editPlantOpen(state: UiInterim, { payload }: AnyAction): UiInterim {
  let { plant = {} } = payload;
  if (Object.prototype.hasOwnProperty.call(plant, 'price')) {
    plant = seamless.asMutable(plant, { deep: true });
    plant.price = plant.price.toString();
  }

  return seamless.set(state, 'plant', { plant });
}

/**
 * action.payload is empty
 */
function editPlantClose(state: UiInterim): UiInterim {
  // Just remove plant element if editing is canceled
  // or if the plant has been saved
  return seamless.without(state, 'plant');
}

/**
 * action.payload:
 * {plant-key: plant-value, ...}
 * state:
 *   plant:
 *     plant
 */
function editPlantChange(state: UiInterim, action: AnyAction): UiInterim {
  return seamless.merge(state, { plant: { plant: action.payload } }, { deep: true });
}

function loadPlantsRequest(state: UiInterim, action: AnyAction): UiInterim {
  return seamless.set(state, 'loadPlantRequest', action.payload);
}

function loadPlantsSuccess(state: UiInterim): UiInterim {
  return seamless.without(state, 'loadPlantRequest');
}

function loadPlantsFailure(state: UiInterim): UiInterim {
  return seamless.without(state, 'loadPlantRequest');
}

const reducers = {
  // Init the note prop in the interim state with something
  // so that the note is editable
  [actionEnum.EDIT_NOTE_OPEN]: editNoteOpen,
  [actionEnum.EDIT_NOTE_CHANGE]: editNoteChange,
  [actionEnum.EDIT_NOTE_CLOSE]: editNoteClose,
  [actionEnum.EDIT_PLANT_OPEN]: editPlantOpen,
  [actionEnum.EDIT_PLANT_CHANGE]: editPlantChange,
  [actionEnum.EDIT_PLANT_CLOSE]: editPlantClose,
  [actionEnum.LOAD_PLANTS_REQUEST]: loadPlantsRequest,
  [actionEnum.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actionEnum.LOAD_PLANTS_FAILURE]: loadPlantsFailure,
};

module.exports = (state: UiInterim = seamless({}), action: AnyAction): UiInterim => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
