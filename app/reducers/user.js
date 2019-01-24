// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const { initialState } = require('../store/user');
const { actionEnum } = require('../actions');

function logoutRequest() {
  return seamless.from({
    status: 'logout',
    isLoggedIn: false,
  });
}

/**
 * logoutSuccess
 * @param {UiUser} state
 * @param {import('redux').AnyAction} action
 * @returns {UiUser}
 */
function logoutSuccess(state, action) {
  return seamless.from(Object.assign(
    {}, {
      status: 'logout',
      isLoggedIn: false,
    },
    action.payload,
  ));
}

/**
 * logoutFailure
 * @param {UiUser} state
 * @param {import('redux').AnyAction} action
 * @returns {UiUser}
 */
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
 * @param {UiUser} state
 * @param {PlantActions.LoadLocationsSuccessAction} action
 * @returns {UiUser}
 */
function loadLocationsSuccess(state, action) {
  // const { payload: locations = [] } = action;
  const { payload: locations } = action;
  if (state.isLoggedIn && !state.activeLocationId) {
    const { _id } = state;

    // Find the first location that this user is a member of
    const location = locations.find(l => !!l.members[_id]);

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
 * @param {UiUser} state
 * @param {import('redux').AnyAction} action
 * @returns {UiUser}
 */
function changeActiveLocationId(state, { payload }) {
  const { _id = '' } = payload || {};
  if (!_id) {
    return state; // should we remove activeLocationId?
  }
  return seamless.set(state, 'activeLocationId', _id);
}

const reducers = {
  [actionEnum.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actionEnum.LOGOUT_FAILURE]: logoutFailure,
  [actionEnum.LOGOUT_REQUEST]: logoutRequest,
  [actionEnum.LOGOUT_SUCCESS]: logoutSuccess,
  [actionEnum.CHANGE_ACTIVE_LOCATION_ID]: changeActiveLocationId,
};

/**
 * The user reducer
 * @param {UiUser} state
 * @param {PlantActions.PlantAction} action
 * @returns {UiUser}
 */
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
