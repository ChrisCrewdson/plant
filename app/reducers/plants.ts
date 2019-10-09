import { AnyAction } from 'redux';
import uniq from 'lodash/uniq';
import si from 'seamless-immutable';
import { actionEnum } from '../actions';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

// An array of plants loaded from the server.
// Plants could be for any user.
// If a user is logged in then some of the items in the array
// might be plants belonging to the user.

// @ts-ignore
const seamless = si.static;

/**
 * This is a helper function for when the action.payload holds a new plant
 * that needs to replace an existing plant in the state object.
 */
function replaceInPlace(state: UiPlants, { payload }: AnyAction): UiPlants {
  return seamless.set(state, payload._id, payload);
}

/**
 * User clicks save after creating a new plant
 */
function createPlantRequest(state: UiPlants, action: AnyAction): UiPlants {
  // payload is an object of new plant being POSTed to server
  // an id has already been assigned to this object
  return replaceInPlace(state, action);
}

function ajaxPlantFailure(state: UiPlants, action: AnyAction): UiPlants {
  return replaceInPlace(state, action);
}

/**
 * @param action - payload is an object of plant being PUT to server
 */
function updatePlantRequest(state: UiPlants, action: AnyAction): UiPlants {
  return replaceInPlace(state, action);
}

/**
 * @param action - action.payload: <plant-id>
 */
function deletePlantRequest(state: UiPlants, action: AnyAction): UiPlants {
  return seamless.without(state, action.payload.plantId);
}

/**
 * payload is {id} of note being DELETEd from server
 * Need to remove this note from the notes array in all plants
 * @param action - action.payload: <noteId>
 */
function deleteNoteRequest(state: UiPlants, { payload: noteId }: AnyAction): UiPlants {
  const initPlants: UiPlants = {};

  return seamless.from(Object.keys(state).reduce((acc, plantId) => {
    const plant = state[plantId];
    if ((plant.notes || []).includes(noteId)) {
      acc[plantId] = seamless.set(plant, 'notes', (plant.notes || []).filter((nId) => nId !== noteId));
    } else {
      acc[plantId] = plant;
    }
    return acc;
  }, initPlants));
}


/**
 * @param action - action.payload is a plant object
 */
function loadPlantSuccess(state: UiPlants, action: AnyAction): UiPlants {
  return replaceInPlace(state, action);
}

function loadPlantFailure(state: UiPlants, action: AnyAction): UiPlants {
  return replaceInPlace(state, action);
}

/**
 * @param action - action.payload is an array of plant objects
 */
function loadPlantsSuccess(state: UiPlants, { payload: plants }: AnyAction): UiPlants {
  if (plants && plants.length > 0) {
    return seamless.merge(state, plants.reduce(
      (acc: UiPlants, plant: UiPlantsValue) => {
        if (plant._id) {
          acc[plant._id] = plant;
        }
        return acc;
      }, {}));
  }
  return state;
}

/**
 * The action.payload.note is the returned note from the server.
 */
function upsertNoteSuccess(state: UiPlants, { payload: { note } }: AnyAction): UiPlants {
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
  const updatedPlants = Object.keys(state).reduce(
    (acc: UiPlants, plantId: string) => {
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
        acc[plantId] = seamless.set(plant, 'notes', plantNotes.filter((noteId) => noteId !== _id));
      }

      return acc;
    }, {});

  // if no changes then return the original state.
  if (!Object.keys(updatedPlants).length) {
    return state;
  }

  return seamless.merge(state, updatedPlants);
}

function loadNotesRequest(state: UiPlants, action: AnyAction): UiPlants {
// action.payload is {
//   noteIds: [<note-id>, <note-id>, ...]
// OR
//   plantIds: [<plant-id>, ...]
// }

  const { plantIds, noteIds } = action.payload;
  if (noteIds) {
    return state;
  }
  if (!plantIds || !plantIds.length) {
    // console.error('No plantIds or length in action.payload:', action.payload);
    return state;
  }

  const requestedPlants = plantIds.reduce(
    (acc: UiPlants, plantId: string) => {
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

/**
 * action.payload is an array of notes from the server
 */
function loadNotesSuccess(state: UiPlants, { payload: notes }: AnyAction): UiPlants {
  if (!notes || !notes.length) {
    return state;
  }

  const plants = notes.reduce(
    (acc: Record<string, string[]>, note: UiNotesValue) => {
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

  return seamless.from(Object.keys(state).reduce(
    (acc: UiPlants, plantId: string) => {
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
  [actionEnum.CREATE_PLANT_FAILURE]: ajaxPlantFailure,
  [actionEnum.CREATE_PLANT_REQUEST]: createPlantRequest,
  [actionEnum.DELETE_NOTE_REQUEST]: deleteNoteRequest,
  [actionEnum.DELETE_PLANT_FAILURE]: ajaxPlantFailure,
  [actionEnum.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actionEnum.LOAD_NOTES_SUCCESS]: loadNotesSuccess,
  [actionEnum.LOAD_NOTES_REQUEST]: loadNotesRequest,
  [actionEnum.LOAD_PLANT_FAILURE]: loadPlantFailure,
  [actionEnum.LOAD_PLANT_SUCCESS]: loadPlantSuccess,
  [actionEnum.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actionEnum.LOAD_UNLOADED_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actionEnum.UPDATE_PLANT_FAILURE]: ajaxPlantFailure,
  [actionEnum.UPDATE_PLANT_REQUEST]: updatePlantRequest,
  [actionEnum.UPSERT_NOTE_SUCCESS]: upsertNoteSuccess,
};

/**
 * The plants reducer
 */
module.exports = (state: UiPlants = seamless.from({}), action: AnyAction): UiPlants => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
