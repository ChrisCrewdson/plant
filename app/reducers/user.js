// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const { initialState } = require('../store/user');
const actions = require('../actions');

function logoutRequest() {
  return seamless.from({
    status: 'logout',
    isLoggedIn: false,
  });
}

function logoutSuccess(state, action) {
  return seamless.from(Object.assign(
    {}, {
      status: 'logout',
      isLoggedIn: false,
    },
    action.payload,
  ));
}

function logoutFailure(state, action) {
  return seamless.from(Object.assign(
    {}, {
      status: 'failed',
      isLoggedIn: false,
    },
    action.payload,
  ));
}

/**
 * Load Location Success is called after a response from server.
 * @param {UserState} state
 * @param {Object} action
 * @param {Array} action.payload - returned locations from the server
 */
function loadLocationsSuccess(state, action) {
  const { payload: locations = [] } = action;
  if (state.isLoggedIn && !state.activeLocationId) {
    const { _id } = state;

    // Find the first location that this user is a member of
    const location = locations.find(l => l.members[_id]);

    if (location) {
      // console.log('found location');
      return seamless.set(state, 'activeLocationId', location._id);
    }
    // console.log('no location found');
  }
  return state;
}


/**
 * Change the active location id
 * @param {UserState} state - existing user state
 * @param {Object} action - object with {payload: { _id: <mongo-id>}}
 * @param {Object} action.payload - { _id: <mongo-id>}
 * @param {String} action.payload._id - mongo-id
 */
function changeActiveLocationId(state, { payload }) {
  const { _id = '' } = payload || {};
  if (!_id) {
    return state; // should we remove activeLocationId?
  }
  return seamless.set(state, 'activeLocationId', _id);
}

const reducers = {
  [actions.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actions.LOGOUT_FAILURE]: logoutFailure,
  [actions.LOGOUT_REQUEST]: logoutRequest,
  [actions.LOGOUT_SUCCESS]: logoutSuccess,
  [actions.CHANGE_ACTIVE_LOCATION_ID]: changeActiveLocationId,
};

// The login reducer
module.exports = (state, action) => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  if (!state) {
    return initialState();
  }

  return state;
};

// This is only exported for testing
module.exports.reducers = reducers;
