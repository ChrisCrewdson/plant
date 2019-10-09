import { AnyAction } from 'redux';
import si from 'seamless-immutable';
import { actionEnum } from '../actions';

// @ts-ignore
const seamless = si.static;

// TODO: If we can keep the plantIds at each location sorted by Title then
// this will save us sorting later which will improve performance.
// We don't have access to the Title for each plantId here so might need
// to fire a sortPlantIdsInLocations event with the plants object as a payload
// if we discover that we're doing sorting.

// The action.payload are the returned locations from the server.

function loadLocationsSuccess(state: UiLocations, { payload }: AnyAction): UiLocations {
  const locations = Object.keys(payload || {}).reduce(
    (acc: UiLocations, locationId: string) => {
      const location = payload[locationId];
      acc[location._id] = { ...location, plantIds: location.plantIds || [] };
      return acc;
    }, {});
  const newState = seamless.merge(state, locations, { deep: true });
  return newState;
}

// User clicks save after creating a new plant, we need to
// add this to the list of plants at this location.
// action.payload is a plant object created in the browser
// Some of the fields:
// _id
// title
// createdBy
function createPlantRequest(state: UiLocations, action: AnyAction): UiLocations {
  // payload is an object of new plant being POSTed to server
  // an _id has already been assigned to this object
  const plant = action.payload;
  let location = state[plant.locationId];
  if (location) {
    // Add the new plantId to the existing list of plantIds at this location
    const plantIds = (location.plantIds || []).concat(plant._id);
    location = { ...location, plantIds };
    // Update the location object with the new list of plantIds
    return seamless.set(state, plant.locationId, location);
  }
  // console.warn(`No location found in locations createPlantRequest reducer ${plant.locationId}`);
  return state;
}

// If a bunch of plants are loaded then check that the plant
// is on the locations' plantIds list
// action.payload is an array of plant objects
function loadPlantsSuccess(state: UiLocations, action: AnyAction): UiLocations {
/** @type {UiPlantsValue[]} */
  const plants: UiPlantsValue[] = action.payload;
  if (plants && plants.length) {
    // Create an object with locations:
    // {'l1': {plantIds: ['p1', p2]}, 'l2': {...}}
    const locations = plants.reduce(
      (acc: UiLocations, { locationId, _id: plantId }: UiPlantsValue) => {
        if (state[locationId]) {
          acc[locationId] = acc[locationId]
            || seamless.asMutable(state[locationId], { deep: true });
          if (plantId && !acc[locationId].plantIds.includes(plantId)) {
            acc[locationId].plantIds.push(plantId);
          }
        }
        return acc;
      }, {});

    return seamless.merge(state, locations, { deep: true });
  }
  return state;
}

/**
 * @param {AnyAction} action - payload:
 *                             {plantId: <plant-id>, locationId: <location-id>}
 */
function deletePlantRequest(state: UiLocations, { payload: { locationId, plantId } }: AnyAction):
 UiLocations {
  const plantIds = (state[locationId] && state[locationId].plantIds) || [];
  if (plantIds.includes(plantId)) {
    const pIds = plantIds.filter((pId) => pId !== plantId);
    return seamless.setIn(state, [locationId, 'plantIds'], pIds);
  }
  return state;
}

// function modifyLocationSuccess(state, action) {
//   // eslint-disable-next-line no-console
//   console.log('reducers.locations.modifyLocationSuccess action', action);
//   // TODO: Fix this
//   return state;
// }

// This is only exported for testing
export const reducers = {
  // [actionEnum.CREATE_LOCATION_REQUEST]: createLocationRequest,
  [actionEnum.CREATE_PLANT_REQUEST]: createPlantRequest,
  // [actionEnum.DELETE_LOCATION_REQUEST]: deleteLocationRequest,
  [actionEnum.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actionEnum.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actionEnum.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actionEnum.LOAD_UNLOADED_PLANTS_SUCCESS]: loadPlantsSuccess,
  // [actionEnum.MODIFY_LOCATION_SUCCESS]: modifyLocationSuccess,
};

export const locations = (state: UiLocations = seamless({}), action: AnyAction): UiLocations => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
