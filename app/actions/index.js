// Redux Actions

const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT = 'LOGOUT';

function logout() {
  return {
    type: LOGOUT,
  };
}

function loginRequest(code) {
  return {
    type: LOGIN_REQUEST,
    payload: code,
  };
}

function loginSuccess(user) {
  return {
    type: LOGIN_SUCCESS,
    payload: user,
  };
}

function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    payload: error,
    error: true,
  };
}

const CREATE_PLANT_REQUEST = 'CREATE_PLANT_REQUEST';
const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';

function createPlantRequest(payload) {
  return {
    type: CREATE_PLANT_REQUEST,
    payload,
  };
}

function createPlantSuccess(payload) {
  return {
    type: CREATE_PLANT_SUCCESS,
    payload,
  };
}

function createPlantFailure(payload) {
  return {
    type: CREATE_PLANT_FAILURE,
    payload,
  };
}

const UPSERT_NOTE_REQUEST = 'UPSERT_NOTE_REQUEST';
const UPSERT_NOTE_SUCCESS = 'UPSERT_NOTE_SUCCESS';
const UPSERT_NOTE_FAILURE = 'UPSERT_NOTE_FAILURE';

function upsertNoteRequest(payload) {
  return {
    type: UPSERT_NOTE_REQUEST,
    payload,
  };
}

function upsertNoteSuccess(payload) {
  return {
    type: UPSERT_NOTE_SUCCESS,
    payload,
  };
}

function upsertNoteFailure(payload) {
  return {
    type: UPSERT_NOTE_FAILURE,
    payload,
  };
}

const UPDATE_PLANT_REQUEST = 'UPDATE_PLANT_REQUEST';
const UPDATE_PLANT_SUCCESS = 'UPDATE_PLANT_SUCCESS';
const UPDATE_PLANT_FAILURE = 'UPDATE_PLANT_FAILURE';

function updatePlantRequest(payload) {
  return {
    type: UPDATE_PLANT_REQUEST,
    payload,
  };
}

function updatePlantSuccess(payload) {
  return {
    type: UPDATE_PLANT_SUCCESS,
    payload,
  };
}

function updatePlantFailure(payload) {
  return {
    type: UPDATE_PLANT_FAILURE,
    payload,
  };
}

const DELETE_NOTE_REQUEST = 'DELETE_NOTE_REQUEST';
const DELETE_NOTE_SUCCESS = 'DELETE_NOTE_SUCCESS';
const DELETE_NOTE_FAILURE = 'DELETE_NOTE_FAILURE';

function deleteNoteRequest(payload) {
  return {
    type: DELETE_NOTE_REQUEST,
    payload,
  };
}

function deleteNoteSuccess(payload) {
  return {
    type: DELETE_NOTE_SUCCESS,
    payload,
  };
}

function deleteNoteFailure(payload) {
  return {
    type: DELETE_NOTE_FAILURE,
    payload,
  };
}

const DELETE_PLANT_REQUEST = 'DELETE_PLANT_REQUEST';
const DELETE_PLANT_SUCCESS = 'DELETE_PLANT_SUCCESS';
const DELETE_PLANT_FAILURE = 'DELETE_PLANT_FAILURE';

function deletePlantRequest(payload) {
  return {
    type: DELETE_PLANT_REQUEST,
    payload,
  };
}

function deletePlantSuccess(payload) {
  return {
    type: DELETE_PLANT_SUCCESS,
    payload,
  };
}

function deletePlantFailure(payload) {
  return {
    type: DELETE_PLANT_FAILURE,
    payload,
  };
}

const LOAD_PLANT_REQUEST = 'LOAD_PLANT_REQUEST';
const LOAD_PLANT_SUCCESS = 'LOAD_PLANT_SUCCESS';
const LOAD_PLANT_FAILURE = 'LOAD_PLANT_FAILURE';

function loadPlantRequest(payload) {
  return {
    type: LOAD_PLANT_REQUEST,
    payload,
  };
}

function loadPlantSuccess(payload) {
  return {
    type: LOAD_PLANT_SUCCESS,
    payload,
  };
}

function loadPlantFailure(payload) {
  return {
    type: LOAD_PLANT_FAILURE,
    payload,
  };
}

const LOAD_PLANTS_REQUEST = 'LOAD_PLANTS_REQUEST';
const LOAD_PLANTS_SUCCESS = 'LOAD_PLANTS_SUCCESS';
const LOAD_PLANTS_FAILURE = 'LOAD_PLANTS_FAILURE';

function loadPlantsRequest(payload) {
  return {
    type: LOAD_PLANTS_REQUEST,
    payload,
  };
}

function loadPlantsSuccess(payload) {
  return {
    type: LOAD_PLANTS_SUCCESS,
    payload,
  };
}

function loadPlantsFailure(payload) {
  return {
    type: LOAD_PLANTS_FAILURE,
    payload,
  };
}

const LOAD_NOTES_REQUEST = 'LOAD_NOTES_REQUEST';
const LOAD_NOTES_SUCCESS = 'LOAD_NOTES_SUCCESS';
const LOAD_NOTES_FAILURE = 'LOAD_NOTES_FAILURE';

function loadNotesRequest(payload) {
  return {
    type: LOAD_NOTES_REQUEST,
    payload,
  };
}

function loadNotesSuccess(payload) {
  return {
    type: LOAD_NOTES_SUCCESS,
    payload,
  };
}

function loadNotesFailure(payload) {
  return {
    type: LOAD_NOTES_FAILURE,
    payload,
  };
}

const LOAD_UNLOADED_PLANTS_REQUEST = 'LOAD_UNLOADED_PLANTS_REQUEST';
const LOAD_UNLOADED_PLANTS_SUCCESS = 'LOAD_UNLOADED_PLANTS_SUCCESS';
const LOAD_UNLOADED_PLANTS_FAILURE = 'LOAD_UNLOADED_PLANTS_FAILURE';

function loadUnloadedPlantsRequest(payload) {
  return {
    type: LOAD_UNLOADED_PLANTS_REQUEST,
    payload,
  };
}

function loadUnloadedPlantsSuccess(payload) {
  return {
    type: LOAD_UNLOADED_PLANTS_SUCCESS,
    payload,
  };
}

function loadUnloadedPlantsFailure(payload) {
  return {
    type: LOAD_UNLOADED_PLANTS_FAILURE,
    payload,
  };
}

const LOAD_USER_REQUEST = 'LOAD_USER_REQUEST';
const LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS';
const LOAD_USER_FAILURE = 'LOAD_USER_FAILURE';

function loadUserRequest(payload) {
  return {
    type: LOAD_USER_REQUEST,
    payload,
  };
}

function loadUserSuccess(payload) {
  return {
    type: LOAD_USER_SUCCESS,
    payload,
  };
}

function loadUserFailure(payload) {
  return {
    type: LOAD_USER_FAILURE,
    payload,
  };
}

const LOAD_USERS_REQUEST = 'LOAD_USERS_REQUEST';
const LOAD_USERS_SUCCESS = 'LOAD_USERS_SUCCESS';
const LOAD_USERS_FAILURE = 'LOAD_USERS_FAILURE';

function loadUsersRequest(payload) {
  return {
    type: LOAD_USERS_REQUEST,
    payload,
  };
}

function loadUsersSuccess(payload) {
  return {
    type: LOAD_USERS_SUCCESS,
    payload,
  };
}

function loadUsersFailure(payload) {
  return {
    type: LOAD_USERS_FAILURE,
    payload,
  };
}

const LOAD_LOCATIONS_REQUEST = 'LOAD_LOCATIONS_REQUEST';
const LOAD_LOCATIONS_SUCCESS = 'LOAD_LOCATIONS_SUCCESS';
const LOAD_LOCATIONS_FAILURE = 'LOAD_LOCATIONS_FAILURE';

function loadLocationsRequest(payload) {
  return {
    type: LOAD_LOCATIONS_REQUEST,
    payload,
  };
}

function loadLocationsSuccess(payload) {
  return {
    type: LOAD_LOCATIONS_SUCCESS,
    payload,
  };
}

function loadLocationsFailure(payload) {
  return {
    type: LOAD_LOCATIONS_FAILURE,
    payload,
  };
}

const EDIT_NOTE_OPEN = 'EDIT_NOTE_OPEN';
const EDIT_NOTE_CLOSE = 'EDIT_NOTE_CLOSE';
const EDIT_NOTE_CHANGE = 'EDIT_NOTE_CHANGE';

function editNoteOpen(payload) {
  return {
    type: EDIT_NOTE_OPEN,
    payload,
  };
}

function editNoteClose(payload) {
  return {
    type: EDIT_NOTE_CLOSE,
    payload,
  };
}

function editNoteChange(payload) {
  return {
    type: EDIT_NOTE_CHANGE,
    payload,
  };
}

const EDIT_PLANT_OPEN = 'EDIT_PLANT_OPEN';
const EDIT_PLANT_CLOSE = 'EDIT_PLANT_CLOSE';
const EDIT_PLANT_CHANGE = 'EDIT_PLANT_CHANGE';

function editPlantOpen(payload) {
  return {
    type: EDIT_PLANT_OPEN,
    payload,
  };
}

function editPlantClose(payload) {
  return {
    type: EDIT_PLANT_CLOSE,
    payload,
  };
}

function editPlantChange(payload) {
  return {
    type: EDIT_PLANT_CHANGE,
    payload,
  };
}

const UPSERT_LOCATION_MEMBER = 'UPSERT_LOCATION_MEMBER';
const UPSERT_LOCATION_WEATHER = 'UPSERT_LOCATION_WEATHER';
const DELETE_LOCATION_MEMBER = 'DELETE_LOCATION_MEMBER';
const DELETE_LOCATION_WEATHER = 'DELETE_LOCATION_WEATHER';

const MODIFY_LOCATION_FAILURE = 'MODIFY_LOCATION_FAILURE';
const MODIFY_LOCATION_REQUEST = 'MODIFY_LOCATION_REQUEST';
const MODIFY_LOCATION_SUCCESS = 'MODIFY_LOCATION_SUCCESS';

function modifyLocationRequest(payload) {
  return {
    type: MODIFY_LOCATION_REQUEST,
    payload,
  };
}

function modifyLocationFailure(payload) {
  return {
    type: MODIFY_LOCATION_FAILURE,
    payload,
  };
}

function modifyLocationSuccess(payload) {
  return {
    type: MODIFY_LOCATION_SUCCESS,
    payload,
  };
}

const CHANGE_ACTIVE_LOCATION_ID = 'CHANGE_ACTIVE_LOCATION_ID';

function changeActiveLocationId(payload) {
  return {
    type: CHANGE_ACTIVE_LOCATION_ID,
    payload,
  };
}

module.exports = {
  CHANGE_ACTIVE_LOCATION_ID,
  CREATE_PLANT_FAILURE,
  CREATE_PLANT_REQUEST,
  CREATE_PLANT_SUCCESS,
  DELETE_LOCATION_MEMBER,
  DELETE_LOCATION_WEATHER,
  DELETE_NOTE_FAILURE,
  DELETE_NOTE_REQUEST,
  DELETE_NOTE_SUCCESS,
  DELETE_PLANT_FAILURE,
  DELETE_PLANT_REQUEST,
  DELETE_PLANT_SUCCESS,
  EDIT_NOTE_CHANGE,
  EDIT_NOTE_CLOSE,
  EDIT_NOTE_OPEN,
  EDIT_PLANT_CHANGE,
  EDIT_PLANT_CLOSE,
  EDIT_PLANT_OPEN,
  UPSERT_LOCATION_MEMBER,
  LOAD_LOCATIONS_FAILURE,
  LOAD_LOCATIONS_REQUEST,
  LOAD_LOCATIONS_SUCCESS,
  LOAD_NOTES_FAILURE,
  LOAD_NOTES_REQUEST,
  LOAD_NOTES_SUCCESS,
  LOAD_PLANT_FAILURE,
  LOAD_PLANT_REQUEST,
  LOAD_PLANT_SUCCESS,
  LOAD_PLANTS_FAILURE,
  LOAD_PLANTS_REQUEST,
  LOAD_PLANTS_SUCCESS,
  LOAD_UNLOADED_PLANTS_FAILURE,
  LOAD_UNLOADED_PLANTS_REQUEST,
  LOAD_UNLOADED_PLANTS_SUCCESS,
  LOAD_USER_FAILURE,
  LOAD_USER_REQUEST,
  LOAD_USER_SUCCESS,
  LOAD_USERS_FAILURE,
  LOAD_USERS_REQUEST,
  LOAD_USERS_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  MODIFY_LOCATION_FAILURE,
  MODIFY_LOCATION_REQUEST,
  MODIFY_LOCATION_SUCCESS,
  UPSERT_LOCATION_WEATHER,
  UPDATE_PLANT_FAILURE,
  UPDATE_PLANT_REQUEST,
  UPDATE_PLANT_SUCCESS,
  UPSERT_NOTE_FAILURE,
  UPSERT_NOTE_REQUEST,
  UPSERT_NOTE_SUCCESS,
  changeActiveLocationId,
  createPlantFailure,
  createPlantRequest,
  createPlantSuccess,
  deleteNoteFailure,
  deleteNoteRequest,
  deleteNoteSuccess,
  deletePlantFailure,
  deletePlantRequest,
  deletePlantSuccess,
  editNoteChange,
  editNoteClose,
  editNoteOpen,
  editPlantChange,
  editPlantClose,
  editPlantOpen,
  loadLocationsFailure,
  loadLocationsRequest,
  loadLocationsSuccess,
  loadNotesFailure,
  loadNotesRequest,
  loadNotesSuccess,
  loadPlantFailure,
  loadPlantRequest,
  loadPlantsFailure,
  loadPlantsRequest,
  loadPlantsSuccess,
  loadPlantSuccess,
  loadUnloadedPlantsFailure,
  loadUnloadedPlantsRequest,
  loadUnloadedPlantsSuccess,
  loadUserFailure,
  loadUserRequest,
  loadUsersFailure,
  loadUsersRequest,
  loadUsersSuccess,
  loadUserSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  logout,
  modifyLocationFailure,
  modifyLocationRequest,
  modifyLocationSuccess,
  updatePlantFailure,
  updatePlantRequest,
  updatePlantSuccess,
  upsertNoteFailure,
  upsertNoteRequest,
  upsertNoteSuccess,
};
