import { produce } from 'immer';
import { actionEnum } from '../actions';

import { initialState } from '../store/user';
import { PlantAction, ChangeActiveLocationIdPayload } from '../../lib/types/redux-payloads';

type RoUiUser = Readonly<UiUser>;

function logoutRequest(state: RoUiUser): Readonly<UiUser> {
  return produce(state, (draft) => {
    draft.status = 'logout';
    draft.isLoggedIn = false;
  });
}

function logoutSuccess(state: RoUiUser): RoUiUser {
  return produce(state, (draft) => {
    draft.status = 'logout';
    draft.isLoggedIn = false;
  });
}

function logoutFailure(state: RoUiUser): RoUiUser {
  return produce(state, (draft) => {
    draft.status = 'failed';
    draft.isLoggedIn = false;
  });
}

/**
 * Load Location Success is called after a response from server.
 */
function loadLocationsSuccess(state: RoUiUser,
  action: PlantAction<UiLocationsValue[]>): RoUiUser {
  // const { payload: locations = [] } = action;
  const { payload: locations } = action;
  if (state.isLoggedIn && !state.activeLocationId) {
    const { _id } = state;

    // Find the first location that this user is a member of
    const location = locations.find((l) => !!l.members[_id]);

    if (location) {
      // console.log('found location');
      return produce(state, (draft) => {
        draft.activeLocationId = location._id;
      });
    }
    // console.log('no location found');
  }
  return state;
}


/**
 * Change the active location id
 */
function changeActiveLocationId(
  state: RoUiUser, action: PlantAction<ChangeActiveLocationIdPayload>): RoUiUser {
  const { payload } = action;
  const { _id = '' } = payload || {};
  if (!_id) {
    return state; // should we remove activeLocationId?
  }
  return produce(state, (draft) => {
    draft.activeLocationId = _id;
  });
}

// This is only exported for testing
export const reducers = {
  [actionEnum.LOAD_LOCATIONS_SUCCESS]: loadLocationsSuccess,
  [actionEnum.LOGOUT_FAILURE]: logoutFailure,
  [actionEnum.LOGOUT_REQUEST]: logoutRequest,
  [actionEnum.LOGOUT_SUCCESS]: logoutSuccess,
  [actionEnum.CHANGE_ACTIVE_LOCATION_ID]: changeActiveLocationId,
};

/**
 * The user reducer
 */
export const user = (state: RoUiUser, action: PlantAction): RoUiUser => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  if (!state) {
    return initialState();
  }

  return state;
};
