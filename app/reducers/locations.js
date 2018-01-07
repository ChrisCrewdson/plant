
const actions = require('../actions');
const seamless = require('seamless-immutable').static;

// The action.payload are the returned locations from the server.
function loadLocationsSuccess(state, { payload }) {
  const locations = Object.keys(payload || {}).reduce((acc, locationId) => {
    const location = payload[locationId];
    acc[location._id] = Object.assign({}, location, {
      plantIds: location.plantIds || [],
    });
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
function createPlantRequest(state, action) {
  // payload is an object of new plant being POSTed to server
  // an _id has already been assigned to this object
  const plant = action.payload;
  let location = state[plant.locationId];
  if (location) {
    // Add the new plantId to the existing list of plantIds at this location
    const plantIds = (location.plantIds || []).concat(plant._id);
    location = Object.assign({}, location, { plantIds });
    // Update the location object with the new list of plantIds
    return seamless.set(state, plant.locationId, location);
  }
  // console.warn(`No location found in locations createPlantRequest reducer ${plant.locationId}`);
  return state;
}

// If a bunch of plants are loaded then check that the plant
// is on the locations' plantIds list
// action.payload is an array of plant objects
function loadPlantsSuccess(state, { payload: plants }) {
  if (plants && plants.length) {
    // Create an object with locations:
    // {'l1': {plantIds: ['p1', p2]}, 'l2': {...}}
    const locations = plants.reduce((acc, { locationId, _id: plantId }) => {
      if (state[locationId]) {
        acc[locationId] = acc[locationId] || seamless.asMutable(state[locationId], { deep: true });
        if (!acc[locationId].plantIds.includes(plantId)) {
          acc[locationId].plantIds.push(plantId);
        }
      }
      return acc;
    }, {});

    return seamless.merge(state, locations, { deep: true });
  }
  return state;
}

// action.payload: {plantId: <plant-id>, locationId: <location-id>}
function deletePlantRequest(state, { payload: { locationId, plantId } }) {
  const plantIds = seamless.getIn(state, [locationId, 'plantIds'], []);
  if (plantIds.includes(plantId)) {
    const pIds = plantIds.filter(pId => pId !== plantId);
    return seamless.setIn(state, [locationId, 'plantIds'], pIds);
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

module.exports = (state = seamless({}), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This state is an object with locationId's as keys and
// each value is an object with:
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
