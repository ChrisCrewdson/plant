
const actions = require('../actions');
const Immutable = require('immutable');

// The action.payload are the users returned users from the server.
function loadUsersSuccess(state, action) {
  const { payload: users = [] } = action;
  const usersSet = users.reduce((acc, user) => {
    acc[user._id] = Object.assign({}, user, {
      locationIds: Immutable.Set(user.locationIds || []),
    });
    return acc;
  }, {});
  const newState = state.mergeDeep(usersSet);
  return newState;
}

// The action.payload is the returned user from the server.
function loadUserSuccess(state, action) {
  return loadUsersSuccess(state, {
    payload: [action.payload],
  });
}

// User clicks save after creating a new location, we need to
// add this to the list of locations owned by this user.
// action.payload is a location object created in the browser
// Some of the fields:
// _id
// title
// userId
// function createLocationRequest(state, action) {
//   // eslint-disable-next-line no-console
//   console.error('crateLocationRequest is not ready to use yet');
//   // payload is an object of new location being POSTed to server
//   // an _id has already been assigned to this object
//   const { payload: location } = action;
//   const user = state.get(location.createdBy);
//   if (user) {
//     const locationIds = user.get('locationIds', Immutable.Set()).add({
//       id: location._id,
//       role: 'owner',
//     });
//     return state.set(location.userId, user.set('locationIds', locationIds));
//   }
//   // console.warn(`No user found in users createLocationRequest reducer ${location.userId}`);
//   return state;
// }

// If a bunch of locations are loaded then check that the location
// is on the user's locationIds list
// action.payload is an array of location objects
// function loadLocationsSuccess(state, action) {
//   if(action.payload && action.payload.length > 0) {

//     // Create an object with users:
//     // {'u1': {locationIds: ['p1', p2]}, 'u2': {...}}
//     const users = action.payload.reduce((acc, location) => {
//       if(state.get(location.userId)) {
//         acc[location.userId] = acc[location.userId] || { locationIds: Immutable.Set() };
//         acc[location.userId].locationIds = acc[location.userId].locationIds.add(location._id);
//       }
//       return acc;
//     }, {});

//     // const isList = List.isList
//     const isSet = Immutable.Set.isSet;
//     function merger(a, b) {
//       if (isSet(a) && isSet(b)) {
//         return a.union(b);
//       } else if(a && a.mergeWith) {
//         return a.mergeWith(merger, b);
//       } else {
//         return b;
//       }
//     }

//     return state.mergeDeepWith(merger, users);
//   } else {
//     return state;
//   }
// }

// action.payload: {locationId: <location-id>, userId: <user-id>}
// function deleteLocationRequest(state, action) {
//   const {userId, locationId} = action.payload;
//   const locationIds = state.getIn([userId, 'locationIds'], Immutable.List());
//   if(locationIds.has(locationId)) {
//     const pIds = locationIds.filter(pId => pId !== locationId);
//     return state.setIn([userId, 'locationIds'], pIds);
//   } else {
//     return state;
//   }
// }

const reducers = {
  // [actions.CREATE_LOCATION_REQUEST]: createLocationRequest,
  // [actions.DELETE_LOCATION_REQUEST]: deleteLocationRequest,
  // [actions.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actions.LOAD_USER_SUCCESS]: loadUserSuccess,
  [actions.LOAD_USERS_SUCCESS]: loadUsersSuccess,
};

if (reducers.undefined) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing action type in users.js - these are the reducers keys:
${Object.keys(reducers).join()}`);
}

module.exports = (state = new Immutable.Map(), action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This state is an object with userId's as keys and each value is an object with:
// _id
// createdAt
// name
// locationIds: [{
//   id: <a location _id>,
//   role: 'owner/manager'
// }, ...]
