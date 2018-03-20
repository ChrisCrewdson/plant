// This file is responsible for making the Ajax calls to
// the server as part of the store's dispatch(action) call.

const actions = require('../actions');
const ajax = require('./ajax');

function loginRequest(store, action) {
  const options = {
    url: `/auth/with?code=${action.payload}`,
    success: actions.loginSuccess,
    failure: actions.loginFailure,
    beforeSend: () => {},
  };
  ajax(store, options);
}

function createPlant(store, action, next) {
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actions.editPlantClose());
    return actions.createPlantSuccess(ajaxResult);
  }

  function failure(ajaxResult) {
    store.dispatch(actions.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actions.createPlantFailure(ajaxResult);
  }

  const options = {
    type: 'POST',
    url: '/api/plant',
    data: action.payload,
    success,
    failure,
  };
  ajax(store, options);
  next(action);
}

// Upload files
// action.payload is an array of file objects:
/*
lastModified: 1472318340000
lastModifiedDate: Sat Aug 27 2016 10:19:00 GMT-0700 (MST)
name: "2016-08-27 10.19.00.jpg"
preview: "blob:http://localhost:9090/43590135-cb1a-42f6-9d75-ea737ea2ce91"
size: 6674516
type: "image/jpeg"
webkitRelativePath:""
*/
function saveFilesRequest(store, action, opts, next) {
  const data = new FormData();
  action.payload.files.forEach((file) => {
    data.append('file', file);
  });
  data.append('note', JSON.stringify(action.payload.note));

  const options = {
    contentType: 'multipart/form-data',
    data,
    failure: opts.failure,
    note: action.payload.note,
    success: opts.success,
    progress: actions.editNoteChange,
    type: 'POST',
    url: '/api/upload',
    fileUpload: true, // removed in ajax function
  };

  ajax(store, options);
  next(action);
}

// action.payload is an object with two properties
// files: An optional array of files
// note: The note being created
function upsertNoteRequest(store, action, next) {
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actions.editNoteClose());
    return actions.upsertNoteSuccess(ajaxResult);
  }

  function failure(ajaxResult) {
    store.dispatch(actions.editNoteChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actions.upsertNoteFailure(ajaxResult);
  }
  const opts = { success, failure };

  if (action.payload.files && action.payload.files.length) {
    saveFilesRequest(store, action, opts, next);
  } else {
    const options = {
      type: 'POST',
      url: '/api/note',
      data: action.payload.note,
      success,
      failure,
    };
    ajax(store, options);
    next(action);
  }
}

function updatePlant(store, action, next) {
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actions.editPlantClose());
    return actions.updatePlantSuccess(ajaxResult);
  }

  function failure(ajaxResult) {
    store.dispatch(actions.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actions.updatePlantFailure(ajaxResult);
  }

  const options = {
    type: 'PUT',
    url: '/api/plant',
    data: action.payload,
    success,
    failure,
  };
  ajax(store, options);
  return next(action);
}

function deletePlantRequest(store, action, next) {
  const options = {
    type: 'DELETE',
    url: `/api/plant/${action.payload.plantId}`,
    success: actions.deletePlantSuccess,
    failure: actions.deletePlantFailure,
  };
  ajax(store, options);
  next(action);
}

function deleteNoteRequest(store, action, next) {
  const options = {
    type: 'DELETE',
    url: `/api/note/${action.payload}`,
    success: actions.deleteNoteSuccess,
    failure: actions.deleteNoteFailure,
  };
  ajax(store, options);
  next(action);
}

function loadPlantRequest(store, action) {
  if (!action.payload._id) {
    // console.error('No _id in loadPlantRequest', (new Error()).stack);
  } else {
    const options = {
      url: `/api/plant/${action.payload._id}`,
      success: actions.loadPlantSuccess,
      failure: actions.loadPlantFailure,
    };
    ajax(store, options);
  }
}

// Get all the plants a user has created
// action.payload is a locationId
function loadPlantsRequest(store, action, next) {
  const locationId = action.payload;
  const options = {
    url: `/api/plants/${locationId}`,
    success: actions.loadPlantsSuccess,
    failure: actions.loadPlantsFailure,
  };
  ajax(store, options);
  next(action);
}

// Get a specific user
function loadUserRequest(store, action) {
  const userId = action.payload;
  const options = {
    url: `/api/user/${userId}`,
    success: actions.loadUserSuccess,
    failure: actions.loadUserFailure,
  };
  ajax(store, options);
}

// Load all the users.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
function loadUsersRequest(store) {
  const options = {
    url: '/api/users',
    success: actions.loadUsersSuccess,
    failure: actions.loadUsersFailure,
  };
  ajax(store, options);
}

// Load all the locations.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
function loadLocationsRequest(store) {
  const options = {
    url: '/api/locations',
    success: actions.loadLocationsSuccess,
    failure: actions.loadLocationsFailure,
  };
  ajax(store, options);
}

// Get all the notes listed
// action.payload is an object with one of 2 properties:
// noteIds: an array of noteIds
// plantIds: an array of plantIds
function loadNotesRequest(store, action, next) {
  const { noteIds, plantIds } = action.payload;
  if (!noteIds && !plantIds) {
    // eslint-disable-next-line no-console
    console.error('No noteIds or plantIds on payload, action:', action);
    return next(action);
  }

  const options = {
    data: { noteIds, plantIds },
    failure: actions.loadNotesFailure,
    success: actions.loadNotesSuccess,
    type: 'POST', // Because we don't know how big the payload will be
    url: '/api/notes',
  };

  ajax(store, options);
  return next(action);
}

// Get all the plants listed
// action.payload is an array of plantIds
function loadUnloadedPlantsRequest(store, action) {
  if (!action.payload || !action.payload.length) {
    // eslint-disable-next-line no-console
    console.error('No plantIds on payload, action:', action);
  }

  const options = {
    data: { plantIds: action.payload },
    failure: actions.loadUnloadedPlantsFailure,
    success: actions.loadUnloadedPlantsSuccess,
    type: 'POST', // Because we don't know how big the payload will be
    url: '/api/unloaded-plants',
  };

  ajax(store, options);
}

/**
 * Entry point for inserting/updating/deleting a part of a location document.
 * @param {Object?} store
 * @param {Object} action
 * @param {Object} action.payload
 * @param {string} action.payload.locationId
 * @param {string} action.payload.userId
 * @param {string} action.payload.role
 * @param {Function} next
 */
function modifyLocationRequest(store, action, next) {
  const { payload: data } = action;

  const options = {
    data,
    failure: actions.modifyLocationFailure,
    success: actions.modifyLocationSuccess,
    type: 'POST',
    url: '/api/location',
  };

  ajax(store, options);
  return next(action);
}

const apis = {
  [actions.CREATE_PLANT_REQUEST]: createPlant,
  [actions.DELETE_NOTE_REQUEST]: deleteNoteRequest,
  [actions.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actions.LOAD_LOCATIONS_REQUEST]: loadLocationsRequest,
  [actions.LOAD_NOTES_REQUEST]: loadNotesRequest,
  [actions.LOAD_PLANT_REQUEST]: loadPlantRequest,
  [actions.LOAD_PLANTS_REQUEST]: loadPlantsRequest,
  [actions.LOAD_UNLOADED_PLANTS_REQUEST]: loadUnloadedPlantsRequest,
  [actions.LOAD_USER_REQUEST]: loadUserRequest,
  [actions.LOAD_USERS_REQUEST]: loadUsersRequest,
  [actions.LOGIN_REQUEST]: loginRequest,
  [actions.MODIFY_LOCATION_REQUEST]: modifyLocationRequest,
  [actions.UPDATE_PLANT_REQUEST]: updatePlant,
  [actions.UPSERT_NOTE_REQUEST]: upsertNoteRequest,
};

module.exports = store => next => (action) => {
  if (apis[action.type]) {
    return apis[action.type](store, action, next);
  }

  return next(action);
};

module.exports.apis = apis;
