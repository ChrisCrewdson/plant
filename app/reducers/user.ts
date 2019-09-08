import { AnyAction } from 'redux';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const seamless = require('seamless-immutable').static;
const { initialState } = require('../store/user');
const { actionEnum: actionEnumIn } = require('../actions');

const actionEnum = actionEnumIn as UiActionsEnum;

function logoutRequest() {
  return seamless.from({
    status: 'logout',
    isLoggedIn: false,
  });
}

function logoutSuccess(state: UiUser, action: AnyAction): UiUser {
  return seamless.from({
    status: 'logout',
    isLoggedIn: false,
    ...action.payload,
  });
}

function logoutFailure(state: UiUser, action: AnyAction): UiUser {
  return seamless.from({
    status: 'failed',
    isLoggedIn: false,
    ...action.payload,
  });
}

/**
 * Load Location Success is called after a response from server.
 */
function loadLocationsSuccess(state: UiUser, action: PlantRedux.LoadLocationsSuccessAction):
 UiUser {
  // const { payload: locations = [] } = action;
  const { payload: locations } = action;
  if (state.isLoggedIn && !state.activeLocationId) {
    const { _id } = state;

    // Find the first location that this user is a member of
    const location = locations.find((l) => !!l.members[_id]);

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
 */
function changeActiveLocationId(state: UiUser, { payload }: AnyAction): UiUser {
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
 */
module.exports = (state: UiUser, action: PlantRedux.PlantAction): UiUser => {
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
