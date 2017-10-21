
const actions = require('../actions');
const Immutable = require('immutable');

// The action.payload are the returned locations from the server.
function loadLocationsSuccess(state, action) {
  const locations = (action.payload || []).reduce((acc, location) => {
    // eslint-disable-next-line no-param-reassign
    location.plantIds = Immutable.Set(location.plantIds || []);
    acc[location._id] = location;
    return acc;
  }, {});
  const newState = state.mergeDeep(locations);
  return newState;
}

// User clicks save after creating a new plant, we need to
// add this to the list of plants at this location.
// action.payload is a plant object created in the browser
// Some of the fields:
// _id
// title
// createdBy
function createPlantRequest(state, action) {
  // payload is an object of new plant being POSTed to server
  // an _id has already been assigned to this object
  const plant = action.payload;
  const location = state.get(plant.locationId);
  if (location) {
    // Add the new plantId to the existing list of plantIds at this location
    const plantIds = location.get('plantIds', Immutable.Set()).add(plant._id);
    // Update the location object with the new list of plantIds
    return state.set(plant.locationId, location.set('plantIds', plantIds));
  }
  // console.warn(`No location found in locations createPlantRequest reducer ${plant.locationId}`);
  return state;
}

const { isSet } = Immutable.Set;
function merger(a, b) {
  if (isSet(a) && isSet(b)) {
    return a.union(b);
  } else if (a && a.mergeWith) {
    return a.mergeWith(merger, b);
  }
  return b;
}


// If a bunch of plants are loaded then check that the plant
// is on the locations's plantIds list
// action.payload is an array of plant objects
function loadPlantsSuccess(state, action) {
  if (action.payload && action.payload.length > 0) {
    // Create an object with locations:
    // {'l1': {plantIds: ['p1', p2]}, 'l2': {...}}
    const locations = action.payload.reduce((acc, plant) => {
      if (state.get(plant.locationId)) {
        acc[plant.locationId] = acc[plant.locationId] || { plantIds: Immutable.Set() };
        acc[plant.locationId].plantIds = acc[plant.locationId].plantIds.add(plant._id);
      }
      return acc;
    }, {});

    return state.mergeDeepWith(merger, locations);
  }
  return state;
}

// action.payload: {plantId: <plant-id>, locationId: <location-id>}
function deletePlantRequest(state, action) {
  const { locationId, plantId } = action.payload;
  const plantIds = state.getIn([locationId, 'plantIds'], Immutable.List());
  if (plantIds.has(plantId)) {
    const pIds = plantIds.filter(pId => pId !== plantId);
    return state.setIn([locationId, 'plantIds'], pIds);
  }
  return state;
}

function modifyLocationSuccess(state, action) {
  // eslint-disable-next-line no-console
  console.log('reducers.locations.modifyLocationSuccess action', action);
  // TODO: Fix this
  return state;
}

const reducers = {
  // [actions.CREATE_LOCATION_REQUEST]: createLocationRequest,
  [actions.CREATE_PLANT_REQUEST]: createPlantRequest,
  // [actions.DELETE_LOCATION_REQUEST]: deleteLocationRequest,
  [actions.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actions.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actions.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.LOAD_UNLOADED_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.MODIFY_LOCATION_SUCCESS]: modifyLocationSuccess,
};

if (reducers.undefined) {
  // eslint-disable-next-line no-console
  console.error(`Missing action type in locations.js - these are the reducers keys:
${Object.keys(reducers).join()}`);
}

module.exports = (state = new Immutable.Map(), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This state is an object with locationId's as keys and each value is an object with:
// _id
// title
// loc (optional)
// plantIds: [plantId1, ...]

// Location collection in DB:

/*
{
  "_id" : ObjectId("5851d7..."),
  "createdBy" : ObjectId("57b4e9..."),
  "members" : {
    "57b4e90d9...": "owner",
  },
  "title" : "The Orchard",
  "loc" : {
    "type" : "Point",
    "coordinates" : {
      "0" : -99.9999,
      "1" : 66.66666
    }
  }
}
*/
