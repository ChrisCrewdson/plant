// This file is responsible for making the Ajax calls to
// the server as part of the store's dispatch(action) call.

const { actionEnum, actionFunc } = require('../actions/index-next');
const ajax = require('./ajax');

/**
 * @param {import('redux').Store} store
 */
function logoutRequest(store /* , action */) {
  /** @type {AjaxOptions} */
  const options = {
    url: '/api/logout',
    success: actionFunc.logoutSuccess,
    failure: actionFunc.logoutFailure,
    beforeSend: () => {},
  };
  ajax(store, options);
}

/**
 * @param {import('redux').Store} store
 * @param {any} action
 * @param {Function} next
 */
function createPlant(store, action, next) {
  /** @param {object} ajaxResult */
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editPlantClose());
    return actionFunc.createPlantSuccess(ajaxResult);
  }

  /** @param {object} ajaxResult */
  function failure(ajaxResult) {
    store.dispatch(actionFunc.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.createPlantFailure(ajaxResult);
  }

  /** @type {AjaxOptions} */
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

/**
 * Upload files
 * action.payload is an array of file objects:
 * lastModified: 1472318340000
 * lastModifiedDate: Sat Aug 27 2016 10:19:00 GMT-0700 (MST)
 * name: "2016-08-27 10.19.00.jpg"
 * preview: "blob:http://localhost:9090/43590135-cb1a-42f6-9d75-ea737ea2ce91"
 * size: 6674516
 * type: "image/jpeg"
 * webkitRelativePath:""
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {any} opts
 * @param {Function} next
 */
function saveFilesRequest(store, action, opts, next) {
  const data = new FormData();
  action.payload.files.forEach(
    /** @param {string} file - TODO: Might be a Blob and not a string */
    (file) => {
      data.append('file', file);
    });
  data.append('note', JSON.stringify(action.payload.note));

  /** @type {AjaxOptions} */
  const options = {
    contentType: 'multipart/form-data',
    data,
    failure: opts.failure,
    note: action.payload.note,
    success: opts.success,
    progress: actionFunc.editNoteChange,
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
/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function upsertNoteRequest(store, action, next) {
  /** @param {object} ajaxResult */
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editNoteClose());
    return actionFunc.upsertNoteSuccess(ajaxResult);
  }

  /** @param {object} ajaxResult */
  function failure(ajaxResult) {
    store.dispatch(actionFunc.editNoteChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.upsertNoteFailure(ajaxResult);
  }
  const opts = { success, failure };

  if (action.payload.files && action.payload.files.length) {
    saveFilesRequest(store, action, opts, next);
  } else {
    /** @type {AjaxOptions} */
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

/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function updatePlant(store, action, next) {
  /** @param {object} ajaxResult */
  function success(ajaxResult) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editPlantClose());
    return actionFunc.updatePlantSuccess(ajaxResult);
  }

  /** @param {object} ajaxResult */
  function failure(ajaxResult) {
    store.dispatch(actionFunc.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.updatePlantFailure(ajaxResult);
  }

  /** @type {AjaxOptions} */
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

/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function deletePlantRequest(store, action, next) {
  const options = {
    type: 'DELETE',
    url: `/api/plant/${action.payload.plantId}`,
    success: actionFunc.deletePlantSuccess,
    failure: actionFunc.deletePlantFailure,
  };
  ajax(store, options);
  next(action);
}

/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function deleteNoteRequest(store, action, next) {
  /** @type {AjaxOptions} */
  const options = {
    type: 'DELETE',
    url: `/api/note/${action.payload}`,
    success: actionFunc.deleteNoteSuccess,
    failure: actionFunc.deleteNoteFailure,
  };
  ajax(store, options);
  next(action);
}

/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 */
function loadPlantRequest(store, action) {
  if (!action.payload._id) {
    // console.error('No _id in loadPlantRequest', (new Error()).stack);
  } else {
    /** @type {AjaxOptions} */
    const options = {
      url: `/api/plant/${action.payload._id}`,
      success: actionFunc.loadPlantSuccess,
      failure: actionFunc.loadPlantFailure,
    };
    ajax(store, options);
  }
}

// Get all the plants a user has created
// action.payload is a locationId
/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function loadPlantsRequest(store, action, next) {
  const locationId = action.payload;
  /** @type {AjaxOptions} */
  const options = {
    url: `/api/plants/${locationId}`,
    success: actionFunc.loadPlantsSuccess,
    failure: actionFunc.loadPlantsFailure,
  };
  ajax(store, options);
  next(action);
}

// Get a specific user
/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 */
function loadUserRequest(store, action) {
  const userId = action.payload;
  /** @type {AjaxOptions} */
  const options = {
    url: `/api/user/${userId}`,
    success: actionFunc.loadUserSuccess,
    failure: actionFunc.loadUserFailure,
  };
  ajax(store, options);
}

// Load all the users.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
/**
 * @param {import('redux').Store} store
 */
function loadUsersRequest(store) {
  /** @type {AjaxOptions} */
  const options = {
    url: '/api/users',
    success: actionFunc.loadUsersSuccess,
    failure: actionFunc.loadUsersFailure,
  };
  ajax(store, options);
}

// Load all the locations.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
/**
 * @param {import('redux').Store} store
 */
function loadLocationsRequest(store) {
  /** @type {AjaxOptions} */
  const options = {
    url: '/api/locations',
    success: actionFunc.loadLocationsSuccess,
    failure: actionFunc.loadLocationsFailure,
  };
  ajax(store, options);
}

// Get all the notes listed
// action.payload is an object with one of 2 properties:
// noteIds: an array of noteIds
// plantIds: an array of plantIds
/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 * @param {Function} next
 */
function loadNotesRequest(store, action, next) {
  const { noteIds, plantIds } = action.payload;
  if (!noteIds && !plantIds) {
    // eslint-disable-next-line no-console
    console.error('No noteIds or plantIds on payload, action:', action);
    return next(action);
  }

  /** @type {AjaxOptions} */
  const options = {
    data: { noteIds, plantIds },
    failure: actionFunc.loadNotesFailure,
    success: actionFunc.loadNotesSuccess,
    type: 'POST', // Because we don't know how big the payload will be
    url: '/api/notes',
  };

  ajax(store, options);
  return next(action);
}

// Get all the plants listed
// action.payload is an array of plantIds
/**
 * @param {import('redux').Store} store
 * @param {ActionMethodResult} action
 */
function loadUnloadedPlantsRequest(store, action) {
  if (!action.payload || !action.payload.length) {
    // eslint-disable-next-line no-console
    console.error('No plantIds on payload, action:', action);
  }

  /** @type {AjaxOptions} */
  const options = {
    data: { plantIds: action.payload },
    failure: actionFunc.loadUnloadedPlantsFailure,
    success: actionFunc.loadUnloadedPlantsSuccess,
    type: 'POST', // Because we don't know how big the payload will be
    url: '/api/unloaded-plants',
  };

  ajax(store, options);
}

/**
 * Entry point for inserting/updating/deleting a part of a location document.
 * @param {Object?} store
 * @param {object} action
 * @param {object} action.payload
 * @param {string} action.payload.locationId
 * @param {string} action.payload.userId
 * @param {string} action.payload.role
 * @param {Function} next
 */
function modifyLocationRequest(store, action, next) {
  const { payload: data } = action;

  /** @type {AjaxOptions} */
  const options = {
    data,
    failure: actionFunc.modifyLocationFailure,
    success: actionFunc.modifyLocationSuccess,
    type: 'POST',
    url: '/api/location',
  };

  ajax(store, options);
  return next(action);
}

/**
 * @type {Dictionary<Function>}
 */
const apis = {
  [actionEnum.CREATE_PLANT_REQUEST]: createPlant,
  [actionEnum.DELETE_NOTE_REQUEST]: deleteNoteRequest,
  [actionEnum.DELETE_PLANT_REQUEST]: deletePlantRequest,
  [actionEnum.LOAD_LOCATIONS_REQUEST]: loadLocationsRequest,
  [actionEnum.LOAD_NOTES_REQUEST]: loadNotesRequest,
  [actionEnum.LOAD_PLANT_REQUEST]: loadPlantRequest,
  [actionEnum.LOAD_PLANTS_REQUEST]: loadPlantsRequest,
  [actionEnum.LOAD_UNLOADED_PLANTS_REQUEST]: loadUnloadedPlantsRequest,
  [actionEnum.LOAD_USER_REQUEST]: loadUserRequest,
  [actionEnum.LOAD_USERS_REQUEST]: loadUsersRequest,
  [actionEnum.LOGOUT_REQUEST]: logoutRequest,
  [actionEnum.MODIFY_LOCATION_REQUEST]: modifyLocationRequest,
  [actionEnum.UPDATE_PLANT_REQUEST]: updatePlant,
  [actionEnum.UPSERT_NOTE_REQUEST]: upsertNoteRequest,
};

/**
 * @param {import('redux').Store} store
 * @returns {Function}
 */
// @ts-ignore - TODO: How does this get typed?
module.exports = store => next => (action) => {
  if (apis[action.type]) {
    return apis[action.type](store, action, next);
  }

  return next(action);
};

module.exports.apis = apis;
