// Redux Actions

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';

export function logout() {
  return {
    type: LOGOUT
  };
}

export function loginRequest(code) {
  return {
    type: LOGIN_REQUEST,
    payload: code
  };
}

export function loginSuccess(user) {
  return {
    type: LOGIN_SUCCESS,
    payload: user
  };
}

export function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    payload: error,
    error: true
  };
}

export const CREATE_PLANT_REQUEST = 'CREATE_PLANT_REQUEST';
export const CREATE_PLANT_SUCCESS = 'CREATE_PLANT_SUCCESS';
export const CREATE_PLANT_FAILURE = 'CREATE_PLANT_FAILURE';

export function createPlantRequest(payload) {
  return {
    type: CREATE_PLANT_REQUEST,
    payload
  };
}

export function createPlantSuccess(payload) {
  return {
    type: CREATE_PLANT_SUCCESS,
    payload
  };
}

export function createPlantFailure(payload) {
  return {
    type: CREATE_PLANT_FAILURE,
    payload
  };
}

export const CREATE_NOTE_REQUEST = 'CREATE_NOTE_REQUEST';
export const CREATE_NOTE_SUCCESS = 'CREATE_NOTE_SUCCESS';
export const CREATE_NOTE_FAILURE = 'CREATE_NOTE_FAILURE';

export function createNoteRequest(payload) {
  return {
    type: CREATE_NOTE_REQUEST,
    payload
  };
}

export function createNoteSuccess(payload) {
  return {
    type: CREATE_NOTE_SUCCESS,
    payload
  };
}

export function createNoteFailure(payload) {
  return {
    type: CREATE_NOTE_FAILURE,
    payload
  };
}



export const UPDATE_PLANT_REQUEST = 'UPDATE_PLANT_REQUEST';
export const UPDATE_PLANT_SUCCESS = 'UPDATE_PLANT_SUCCESS';
export const UPDATE_PLANT_FAILURE = 'UPDATE_PLANT_FAILURE';

export function updatePlantRequest(payload) {
  return {
    type: UPDATE_PLANT_REQUEST,
    payload
  };
}

export function updatePlantSuccess(payload) {
  return {
    type: UPDATE_PLANT_SUCCESS,
    payload
  };
}

export function updatePlantFailure(payload) {
  return {
    type: UPDATE_PLANT_FAILURE,
    payload
  };
}

export const DELETE_PLANT_REQUEST = 'DELETE_PLANT_REQUEST';
export const DELETE_PLANT_SUCCESS = 'DELETE_PLANT_SUCCESS';
export const DELETE_PLANT_FAILURE = 'DELETE_PLANT_FAILURE';

export function deletePlantRequest(payload) {
  return {
    type: DELETE_PLANT_REQUEST,
    payload
  };
}

export function deletePlantSuccess(payload) {
  return {
    type: DELETE_PLANT_SUCCESS,
    payload
  };
}

export function deletePlantFailure(payload) {
  return {
    type: DELETE_PLANT_FAILURE,
    payload
  };
}

export const LOAD_PLANT_REQUEST = 'LOAD_PLANT_REQUEST';
export const LOAD_PLANT_SUCCESS = 'LOAD_PLANT_SUCCESS';
export const LOAD_PLANT_FAILURE = 'LOAD_PLANT_FAILURE';

export function loadPlant(payload) {
  return {
    type: LOAD_PLANT_REQUEST,
    payload
  };
}

export function loadPlantSuccess(payload) {
  return {
    type: LOAD_PLANT_SUCCESS,
    payload
  };
}

export function loadPlantFailure(payload) {
  return {
    type: LOAD_PLANT_FAILURE,
    payload
  };
}


export const LOAD_PLANTS_REQUEST = 'LOAD_PLANTS_REQUEST';
export const LOAD_PLANTS_SUCCESS = 'LOAD_PLANTS_SUCCESS';
export const LOAD_PLANTS_FAILURE = 'LOAD_PLANTS_FAILURE';

export function loadPlants(payload) {
  return {
    type: LOAD_PLANTS_REQUEST,
    payload
  };
}

export function loadPlantsSuccess(payload) {
  return {
    type: LOAD_PLANTS_SUCCESS,
    payload
  };
}

export function loadPlantsFailure(payload) {
  return {
    type: LOAD_PLANTS_FAILURE,
    payload
  };
}

export const SET_PLANT_MODE = 'SET_PLANT_MODE';
export const CANCEL_PLANT_CREATE_MODE = 'CANCEL_PLANT_CREATE_MODE';

// payload should be:
// { _id: <plant-id>, mode: 'read/create/update'}
export function setPlantMode(payload) {
  return {
    type: SET_PLANT_MODE,
    payload
  };
}

// payload: <plant-id>
export function cancelPlantCreateMode(payload) {
  return {
    type: CANCEL_PLANT_CREATE_MODE,
    payload
  };
}

export const CREATE_NOTE = 'CREATE_NOTE';

// payload: { _id: <plant-id>}
export function createNote(payload) {
  return {
    type: CREATE_NOTE,
    payload
  };
}
