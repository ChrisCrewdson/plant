const { initialState } = require('../store/user');
const Immutable = require('immutable');
const actions = require('../actions');

function loginRequest() {
  return Immutable.fromJS({
    status: 'fetching',
  });
}

function loginSuccess(state, action) {
  return Immutable.fromJS(Object.assign(
    {}, {
      status: 'success',
      isLoggedIn: true,
    },
    action.payload,
  ));
}

function loginFailure(state, action) {
  return Immutable.fromJS(Object.assign(
    {}, {
      status: 'failed',
      isLoggedIn: false,
    },
    action.payload,
  ));
}

function logout() {
  return Immutable.fromJS({});
}

// The action.payload are the returned locations from the server.
function loadLocationsSuccess(state, action) {
  const { payload: locations = [] } = action;
  if (state.get('isLoggedIn', false) && !state.get('activeLocationId', '')) {
    const _id = state.get('_id');

    // Find the first location that this user is a member of
    const location = locations.find(l => l.members[_id]);

    if (location) {
      // console.log('found location');
      return state.set('activeLocationId', location._id);
    }
    // console.log('no location found');
  }
  return state;
}


/**
 * Change the active location id
 * @param {ImmutableJS} state - existing immutable state
 * @param {object} action - object with {payload: { _id: <mongo-id}}
 */
function changeActiveLocationId(state, { payload }) {
  const { _id } = payload;
  return state.set('activeLocationId', _id);
}

const reducers = {
  [actions.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actions.LOGIN_FAILURE]: loginFailure,
  [actions.LOGIN_REQUEST]: loginRequest,
  [actions.LOGIN_SUCCESS]: loginSuccess,
  [actions.LOGOUT]: logout,
  [actions.CHANGE_ACTIVE_LOCATION_ID]: changeActiveLocationId,
};

if (reducers.undefined) {
  // eslint-disable-next-line no-console
  console.error(`Missing action type in user.js - these are the reducers keys:
${Object.keys(reducers).join()}`);
}

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
