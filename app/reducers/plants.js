// An array of plants loaded from the server.
// Plants could be for any user.
// If a user is logged in then some of the items in the array
// might be plants belonging to the user.

// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const uniq = require('lodash/uniq');
const actions = require('../actions');

/**
 * This is a helper function for when the action.payload holds a new plant
 * that needs to replace an existing plant in the state object.
 * @param {object} state - existing object of plants. Each key is a mongoId
 * @param {object} action - has type and payload
 * @returns {object} - new state
 */
function replaceInPlace(state, { payload }) {
  return seamless.set(state, payload._id, payload);
}

// User clicks save after creating a new plant
function createPlantRequest(state, action) {
  // payload is an object of new plant being POSTed to server
  // an id has already been assigned to this object
  return replaceInPlace(state, action);
}

function ajaxPlantFailure(state, action) {
  return replaceInPlace(state, action);
}

function updatePlantRequest(state, action) {
  // payload is an object of plant being PUT to server
  return replaceInPlace(state, action);
}

// action.payload: <plant-id>
function deletePlantRequest(state, action) {
  // payload is _id of plant being DELETEd from server
  return seamless.without(state, action.payload.plantId);
}

// action.payload: <noteId>
// payload is {id} of note being DELETEd from server
// Need to remove this note from the notes array in all plants
function deleteNoteRequest(state, { payload: noteId }) {
  return seamless.from(Object.keys(state).reduce((acc, plantId) => {
    const plant = state[plantId];
    if ((plant.notes || []).includes(noteId)) {
      acc[plantId] = seamless.set(plant, 'notes', plant.notes.filter(nId => nId !== noteId));
    } else {
      acc[plantId] = plant;
    }
    return acc;
  }, {}));
}

// action.payload is a plant object
function loadPlantSuccess(state, action) {
  return replaceInPlace(state, action);
}

function loadPlantFailure(state, action) {
  return replaceInPlace(state, action);
}

// action.payload is an array of plant objects
function loadPlantsSuccess(state, { payload: plants }) {
  if (plants && plants.length > 0) {
    return seamless.merge(state, plants.reduce((acc, plant) => {
      acc[plant._id] = plant;
      return acc;
    }, {}));
  }
  return state;
}

// The action.payload.note is the returned note from the
// server.
function upsertNoteSuccess(state, { payload: { note } }) {
  const {
    _id, // The id of the note
    plantIds = [], // The plants that this note applies to
  } = note;

  if (!plantIds.length) {
    // console.error('No plantIds in upsertNoteSuccess:', action);
    return state;
  }

  // The upsertNote might have added and/or removed associated plants
  // for that note. As such, we need to iterate through all the plants
  // in the state object and check the `notes` collection in each
  // plant.
  // If the `notes` collection has the _id and the plantIds does not
  // have that plant's id then we need to remove that note's id from
  // the plant's `notes` collection.
  // If the `notes` collection does not have the _id and the plantIds
  // has that plant's id then we need add the note's id to that plant's
  // `notes` collection.

  // Iterate through all the plants in the state object and get from
  // that a new object of plants that have to be updated.
  const updatedPlants = Object.keys(state).reduce((acc, plantId) => {
    const plant = state[plantId];
    const plantNotes = plant.notes || [];

    // Should this plant have this note?
    const shouldHaveNote = plantIds.includes(plantId);
    // Does this plant have this note?
    const hasNote = plantNotes.includes(_id);

    // If should have and has, do nothing
    // If should not have and does not have, do nothing
    // If should have and does not have, then add it.
    if (shouldHaveNote && !hasNote) {
      acc[plantId] = seamless.merge(plant, {
        notes: plantNotes.concat(_id),
      });
    }

    // If should not have and has, then remove it
    if (!shouldHaveNote && hasNote) {
      acc[plantId] = seamless.set(plant, 'notes', plantNotes.filter(noteId => noteId !== _id));
    }

    return acc;
  }, {});

  // if no changes then return the original state.
  if (!Object.keys(updatedPlants).length) {
    return state;
  }

  return seamless.merge(state, updatedPlants);
}

// action.payload is {
//   noteIds: [<note-id>, <note-id>, ...]
// OR
//   plantIds: [<plant-id>, ...]
// }
function loadNotesRequest(state, action) {
  const { plantIds, noteIds } = action.payload;
  if (noteIds) {
    return state;
  }
  if (!plantIds || !plantIds.length) {
    // console.error('No plantIds or length in action.payload:', action.payload);
    return state;
  }

  const requestedPlants = plantIds.reduce((acc, plantId) => {
    const plant = state[plantId];
    if (!plant) {
      // console.error('No plant in state for plantId:', plantId);
      return acc;
    }
    acc[plantId] = seamless.set(plant, 'notesRequested', true);
    return acc;
  }, {});

  return seamless.merge(state, requestedPlants);
}

// action.payload is an array of notes from the server
function loadNotesSuccess(state, { payload: notes }) {
  if (!notes || !notes.length) {
    return state;
  }

  const plants = notes.reduce((acc, note) => {
    (note.plantIds || []).forEach((plantId) => {
      if (acc[plantId]) {
        acc[plantId].push(note._id);
      } else {
        acc[plantId] = [note._id];
      }
    });
    return acc;
  }, {});

  if (!Object.keys(plants).length) {
    return state;
  }

  return seamless.from(Object.keys(state).reduce((acc, plantId) => {
    const plant = state[plantId];

    if (!plants[plantId]) {
      acc[plantId] = plant;
      return acc;
    }

    const plantNotes = uniq((plant.notes || []).concat(plants[plantId]));
    acc[plantId] = seamless.set(plant, 'notes', plantNotes);
    return acc;
  }, {}));
}

const reducers = {
  [actions.CREATE_PLANT_FAILURE]: ajaxPlantFailure,
  [actions.CREATE_PLANT_REQUEST]: createPlantRequest,
  [actions.DELETE_NOTE_REQUEST]: deleteNoteRequest,
  [actions.DELETE_PLANT_FAILURE]: ajaxPlantFailure,
  [actions.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actions.LOAD_NOTES_SUCCESS]: loadNotesSuccess,
  [actions.LOAD_NOTES_REQUEST]: loadNotesRequest,
  [actions.LOAD_PLANT_FAILURE]: loadPlantFailure,
  [actions.LOAD_PLANT_SUCCESS]: loadPlantSuccess,
  [actions.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.LOAD_UNLOADED_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.UPDATE_PLANT_FAILURE]: ajaxPlantFailure,
  [actions.UPDATE_PLANT_REQUEST]: updatePlantRequest,
  [actions.UPSERT_NOTE_SUCCESS]: upsertNoteSuccess,
};

module.exports = (state = seamless.from({}), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
