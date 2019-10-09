import { AnyAction } from 'redux';
import si from 'seamless-immutable';
import { actionEnum } from '../actions';

// @ts-ignore
const seamless = si.static;

/**
 * Called after users received back from server request
 * The action.payload are the users returned users from the server.
 */
function loadUsersSuccess(state: UiUsers, action: AnyAction): UiUsers {
  const users: UiUsersValue[] = /** @type {UiUsersValue[]} */ (action.payload || []);
  const usersSet = users.reduce((acc, user) => {
    acc[user._id] = { ...user, locationIds: user.locationIds || [] };
    return acc;
  }, {} as UiUsers);

  if (!Object.keys(usersSet).length) {
    return state;
  }

  const newState = seamless.merge(state, usersSet, { deep: true });
  return newState;
}

/**
 * The action.payload is the returned user from the server.
 */
function loadUserSuccess(state: UiUsers, action: AnyAction): UiUsers {
  return loadUsersSuccess(state, {
    payload: [action.payload],
    type: action.type,
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

// This is only exported for testing
export const reducers = {
  // [actionEnum.CREATE_LOCATION_REQUEST]: createLocationRequest,
  // [actionEnum.DELETE_LOCATION_REQUEST]: deleteLocationRequest,
  // [actionEnum.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actionEnum.LOAD_USER_SUCCESS]: loadUserSuccess,
  [actionEnum.LOAD_USERS_SUCCESS]: loadUsersSuccess,
};

/**
 * The action.payload is the returned user from the server.
 */
export const users = (state: UiUsers = seamless.from({}), action: AnyAction): UiUsers => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};

// This state is an object with userId's as keys and each value is an object with:
// _id
// createdAt
// name
// locationIds: [<a location _id>, <another location _id>, ...]
