// An array of plants loaded from the server.
// Plants could be for any user.
// If a user is logged in then some of the items in the array
// might be plants belonging to the user.

const actions = require('../actions');
const Immutable = require('immutable');

/**
 * This is a helper function for when the action.payload holds a new plant
 * that needs to replace an existing plant in the state object.
 * @param {object} state - existing object of plants. Each key is a mongoId
 * @param {object} action - has type and payload
 * @returns {object} - new state
 */
function replaceInPlace(state, action) {
  return state.mergeDeep({
    [action.payload._id]: action.payload,
  });
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
  return state.delete(action.payload.plantId);
}

// action.payload: <noteId>
// payload is {id} of note being DELETEd from server
// Need to remove this note from the notes array in all plants
function deleteNoteRequest(state, action) {
  return state.map((plant) => {
    const noteIds = Immutable.Set(plant.get('notes', Immutable.Set()));
    if (noteIds.size) {
      if (noteIds.has(action.payload)) {
        return plant.set('notes', noteIds.delete(action.payload));
      }
      return plant;
    }
    return plant;
  });
}

// action.payload is a plant object
function loadPlantSuccess(state, action) {
  return replaceInPlace(state, action);
}

function loadPlantFailure(state, action) {
  return replaceInPlace(state, action);
}

// action.payload is an array of plant objects
function loadPlantsSuccess(state, action) {
  if (action.payload && action.payload.length > 0) {
    // const plants = plantArrayToObject(action.payload);
    // return Object.freeze(Object.assign({}, state, plants));
    return state.mergeDeep(action.payload.reduce((acc, plant) => {
      acc[plant._id] = plant;
      return acc;
    }, {}));
  }
  return state;
}

// The action.payload.note is the returned note from the
// server.
function upsertNoteSuccess(state, action) {
  const {
    _id,
    plantIds = [],
  } = action.payload.note;

  if (!plantIds.length) {
    // console.error('No plantIds in upsertNoteSuccess:', action);
    return state;
  }

  // If plantIds has plantId, then make sure notes has noteId
  // If plantIds does not have plantId, then make sure notes does not have noteId
  return state.map((plant, plantId) => {
    const noteIds = Immutable.Set(plant.get('notes', Immutable.Set()));
    const hasNoteId = noteIds.has(_id);

    if (plantIds.indexOf(plantId) === -1) {
      // Make sure plant does not have the _id in its notes List
      if (hasNoteId) {
        return plant.set('notes', noteIds.delete(_id));
      }
      return plant;
    }
    // Make sure the plant had the _id in its notes List
    if (hasNoteId) {
      return plant;
    }
    return plant.set('notes', noteIds.add(_id));
  });
}

// action.payload is {
//   noteIds: [<note-id>, <note-id>, ...]
// OR
//   plantId: <plant-id>
// }
function loadNotesRequest(state, action) {
  const { plantId, noteIds } = action.payload;
  if (noteIds) {
    return state;
  }
  if (!plantId) {
    // console.error('No plantId in action.payload:', action.payload);
    return state;
  }
  const plant = state.get(plantId);
  if (!plant) {
    // console.error('No plant in state for plantId:', plantId);
    return state;
  }
  return state.set(plantId, plant.set('notesRequested', true));
}

// action.payload is an array of notes from the server
function loadNotesSuccess(state, action) {
  if (action.payload && action.payload.length > 0) {
    const plants = action.payload.reduce((acc, note) => {
      (note.plantIds || []).forEach((plantId) => {
        if (acc[plantId]) {
          acc[plantId].push(note._id);
        } else {
          acc[plantId] = [note._id];
        }
      });
      return acc;
    }, {});

    return state.map((plant, plantId) => {
      if (!plants[plantId]) {
        return plant;
      }

      return plant.set('notes', Immutable.Set(plant.get('notes', Immutable.Set()).concat(plants[plantId])));
    });
  }
  return state;
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

if (reducers.undefined) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing action type in plants.js - these are the reducers keys:
${Object.keys(reducers).join()}`);
}

module.exports = (state = new Immutable.Map(), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
