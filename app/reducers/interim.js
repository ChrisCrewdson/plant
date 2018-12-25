// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;

const { actionEnum } = require('../actions');

/**
 * editNoteOpen
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
function editNoteOpen(state, action) {
//  * @param {UiNotesValue} action.payload
  return seamless.set(state, 'note', action.payload);
}

/**
 * editNoteClose
 * @param {UiInterim} state
 * @returns {UiInterim}
 */
function editNoteClose(state) {
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
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
function editNoteChange(state, action) {
//  * @param {UiNotesValue} action.payload
  return seamless.merge(state, { note: { note: action.payload } }, { deep: true });
}

// action.payload:
// {plant}
/**
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
function editPlantOpen(state, { payload }) {
  let { plant = {} } = payload;
  if (Object.prototype.hasOwnProperty.call(plant, 'price')) {
    plant = seamless.asMutable(plant, { deep: true });
    plant.price = plant.price.toString();
  }

  return seamless.set(state, 'plant', { plant });
}

/**
 * action.payload is empty
 * @param {UiInterim} state
 * @returns {UiInterim}
 */
function editPlantClose(state) {
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
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
function editPlantChange(state, action) {
  return seamless.merge(state, { plant: { plant: action.payload } }, { deep: true });
}

/**
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
function loadPlantsRequest(state, action) {
  return seamless.set(state, 'loadPlantRequest', action.payload);
}

/**
 * @param {UiInterim} state
 * @returns {UiInterim}
 */
function loadPlantsSuccess(state) {
  return seamless.without(state, 'loadPlantRequest');
}

/**
 * @param {UiInterim} state
 * @returns {UiInterim}
 */
function loadPlantsFailure(state) {
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

/**
 * @param {UiInterim} state
 * @param {import('redux').AnyAction} action
 * @returns {UiInterim}
 */
module.exports = (state = seamless({}), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
