// This file is responsible for making the Ajax calls to
// the server as part of the store's dispatch(action) call.

import {
  Action,
  Dispatch,
  Store,
  AnyAction,
} from 'redux';
import { actionEnum, actionFunc } from '../actions';
import { ajax, AjaxOptions } from './ajax';

function logoutRequest(store: Store /* , action */) {
  const options: AjaxOptions = {
    url: '/api/logout',
    success: actionFunc.logoutSuccess,
    failure: actionFunc.logoutFailure,
    beforeSend: () => {},
  };
  ajax(store, options);
}

function createPlant(store: Store, action: any, next: Function) {
  function success(ajaxResult: object) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editPlantClose());
    return actionFunc.createPlantSuccess(ajaxResult);
  }

  function failure(ajaxResult: object) {
    store.dispatch(actionFunc.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.createPlantFailure(ajaxResult);
  }

  const options: AjaxOptions = {
    type: 'POST',
    url: '/api/plant',
    data: action.payload,
    success,
    failure,
  };
  ajax(store, options);
  next(action);
}

interface SaveFilesRequestOptions {
  failure: Function;
  success: Function;
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
 */
function saveFilesRequest(store: Store, action: PlantRedux.PlantAction,
  opts: SaveFilesRequestOptions, next: Function) {
  const { payload } = action as { payload: UpsertNoteRequestPayload};

  const data = new FormData();
  // @ts-ignore - TODO: Come back and fix this
  const files: (string | Blob)[] = payload && payload.files;
  const note = payload && payload.note;
  if (files && files.length) {
    files.forEach((file) => {
      data.append('file', file);
    });
  }
  data.append('note', JSON.stringify(note));

  const options: AjaxOptions = {
    contentType: 'multipart/form-data',
    data,
    failure: opts.failure,
    note,
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
function upsertNoteRequest(store: Store, action: PlantRedux.PlantAction, next: Function) {
  // eslint-disable-next-line prefer-destructuring
  const payload: UpsertNoteRequestPayload = action.payload;

  function success(ajaxResult: object) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editNoteClose());
    return actionFunc.upsertNoteSuccess(ajaxResult);
  }

  function failure(ajaxResult: object) {
    store.dispatch(actionFunc.editNoteChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.upsertNoteFailure(ajaxResult);
  }
  const opts = { success, failure };

  if (payload && payload.files && payload.files.length) {
    saveFilesRequest(store, action, opts, next);
  } else {
    const options: AjaxOptions = {
      type: 'POST',
      url: '/api/note',
      data: payload && payload.note,
      success,
      failure,
    };
    ajax(store, options);
    next(action);
  }
}

function updatePlant(store: Store, action: PlantRedux.PlantAction, next: Function) {
  function success(ajaxResult: object) {
    // This will cause the edit note window to close
    store.dispatch(actionFunc.editPlantClose());
    return actionFunc.updatePlantSuccess(ajaxResult);
  }

  function failure(ajaxResult: object) {
    store.dispatch(actionFunc.editPlantChange({
      errors: {
        general: ajaxResult.toString(),
      },
    }));
    return actionFunc.updatePlantFailure(ajaxResult);
  }

  const options: AjaxOptions = {
    type: 'PUT',
    url: '/api/plant',
    data: action.payload,
    success,
    failure,
  };
  ajax(store, options);
  return next(action);
}

function deletePlantRequest(store: Store, action: PlantRedux.PlantAction, next: Function) {
  const { plantId } = action.payload || {};
  if (plantId) {
    const options = {
      type: 'DELETE',
      url: `/api/plant/${plantId}`,
      success: actionFunc.deletePlantSuccess,
      failure: actionFunc.deletePlantFailure,
    };
    ajax(store, options);
  }
  next(action);
}

function deleteNoteRequest(store: Store, action: PlantRedux.PlantAction, next: Function) {
  const options: AjaxOptions = {
    type: 'DELETE',
    url: `/api/note/${action.payload}`,
    success: actionFunc.deleteNoteSuccess,
    failure: actionFunc.deleteNoteFailure,
  };
  ajax(store, options);
  next(action);
}

function loadPlantRequest(store: Store, action: PlantRedux.PlantAction) {
  const { _id } = action.payload || {};

  if (_id) {
    const options: AjaxOptions = {
      url: `/api/plant/${_id}`,
      success: actionFunc.loadPlantSuccess,
      failure: actionFunc.loadPlantFailure,
    };
    ajax(store, options);
  }
}

// Get all the plants a user has created
// action.payload is a locationId
function loadPlantsRequest(store: Store, action: PlantRedux.PlantAction, next: Function) {
  const locationId = action.payload;
  const options: AjaxOptions = {
    url: `/api/plants/${locationId}`,
    success: actionFunc.loadPlantsSuccess,
    failure: actionFunc.loadPlantsFailure,
  };
  ajax(store, options);
  next(action);
}

// Get a specific user
function loadUserRequest(store: Store, action: PlantRedux.PlantAction) {
  const userId = action.payload;
  const options: AjaxOptions = {
    url: `/api/user/${userId}`,
    success: actionFunc.loadUserSuccess,
    failure: actionFunc.loadUserFailure,
  };
  ajax(store, options);
}

// Load all the users.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
function loadUsersRequest(store: Store) {
  const options: AjaxOptions = {
    url: '/api/users',
    success: actionFunc.loadUsersSuccess,
    failure: actionFunc.loadUsersFailure,
  };
  ajax(store, options);
}

// Load all the locations.
// At some point in the future we'll want paging but for now grab all of them
// action.payload at this point is undefined
function loadLocationsRequest(store: Store) {
  const options: AjaxOptions = {
    url: '/api/locations',
    success: actionFunc.loadLocationsSuccess,
    failure: actionFunc.loadLocationsFailure,
  };
  ajax(store, options);
}

interface LoadNotesRequestPayload {
  plantIds?: string[];
  noteIds?: string[];
}

// Get all the notes listed
// action.payload is an object with one of 2 properties:
// noteIds: an array of noteIds
// plantIds: an array of plantIds
function loadNotesRequest(store: Store, action: PlantRedux.PlantAction<LoadNotesRequestPayload>,
  next: Function) {
  const { plantIds, noteIds } = action.payload || {};

  if (!noteIds && !plantIds) {
    // eslint-disable-next-line no-console
    console.error('No noteIds or plantIds on payload, action:', action);
    return next(action);
  }

  const options: AjaxOptions = {
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
function loadUnloadedPlantsRequest(store: Store, action: PlantRedux.PlantAction) {
  if (!action.payload || !action.payload.length) {
    // eslint-disable-next-line no-console
    console.error('No plantIds on payload, action:', action);
  }

  const options: AjaxOptions = {
    data: { plantIds: action.payload },
    failure: actionFunc.loadUnloadedPlantsFailure,
    success: actionFunc.loadUnloadedPlantsSuccess,
    type: 'POST', // Because we don't know how big the payload will be
    url: '/api/unloaded-plants',
  };

  ajax(store, options);
}

interface ModifyLocationRequestAction {
  payload: {
    locationId: string;
    userId: string;
    role: string;
  };
}

/**
 * Entry point for inserting/updating/deleting a part of a location document.
 */
function modifyLocationRequest(store: Store<any, AnyAction> | null,
  action: ModifyLocationRequestAction, next: Function) {
  if (!store) {
    return next(action);
  }

  const { payload: data } = action;

  const options: AjaxOptions = {
    data,
    failure: actionFunc.modifyLocationFailure,
    success: actionFunc.modifyLocationSuccess,
    type: 'POST',
    url: '/api/location',
  };

  ajax(store, options);
  return next(action);
}

export const apis: Record<string, Function> = {
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

export const api = (store: Store): Function => (next: Dispatch) => (action: Action) => {
  if (apis[action.type]) {
    return apis[action.type](store, action, next);
  }

  return next(action);
};
