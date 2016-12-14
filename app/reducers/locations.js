
const actions = require('../actions');
const Immutable = require('immutable');

// The action.payload are the returned locations from the server.
function loadLocationsSuccess(state, action) {
  const locations = (action.payload || []).reduce((acc, location) => {
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
// userId
function createPlantRequest(state, action) {
  // payload is an object of new plant being POSTed to server
  // an _id has already been assigned to this object
  const plant = action.payload;
  const location = state.get(plant.locationId);
  if(location) {
    const plantIds = location.get('plantIds', Immutable.Set()).add(plant._id);
    return state.set(plant.locationId, location.set('plantIds', plantIds));
  } else {
    console.warn(`No location found in locations createPlantRequest reducer ${plant.locationId}`);
    return state;
  }
}

// If a bunch of plants are loaded then check that the plant
// is on the locations's plantIds list
// action.payload is an array of plant objects
function loadPlantsSuccess(state, action) {
  if(action.payload && action.payload.length > 0) {

    // Create an object with locations:
    // {'l1': {plantIds: ['p1', p2]}, 'l2': {...}}
    const locations = action.payload.reduce((acc, plant) => {
      if(state.get(plant.locationId)) {
        acc[plant.locationId] = acc[plant.locationId] || { plantIds: Immutable.Set() };
        acc[plant.locationId].plantIds = acc[plant.locationId].plantIds.add(plant._id);
      }
      return acc;
    }, {});

    // const isList = List.isList
    const isSet = Immutable.Set.isSet;
    function merger(a, b) {
      if (isSet(a) && isSet(b)) {
        return a.union(b);
      } else if(a && a.mergeWith) {
        return a.mergeWith(merger, b);
      } else {
        return b;
      }
    }

    return state.mergeDeepWith(merger, locations);
  } else {
    return state;
  }
}

// action.payload: {plantId: <plant-id>, locationId: <location-id>}
function deletePlantRequest(state, action) {
  const {locationId, plantId} = action.payload;
  const plantIds = state.getIn([locationId, 'plantIds'], Immutable.List());
  if(plantIds.has(plantId)) {
    const pIds = plantIds.filter(pId => pId !== plantId);
    return state.setIn([locationId, 'plantIds'], pIds);
  } else {
    return state;
  }
}

const reducers = {
  [actions.CREATE_PLANT_REQUEST]: createPlantRequest,
  [actions.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actions.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.LOAD_UNLOADED_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actions.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
};

module.exports = (state = new Immutable.Map(), action) => {
  if(reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This state is an object with locationId's as keys and each value is an object with:
// _id
// title
// loc (optional)
// plantIds: [plantId1, ...]
