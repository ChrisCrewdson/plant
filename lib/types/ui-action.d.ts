
interface UiActions {
  // TODO: Should we split out the action object into two objects. One with string values
  // and the other with functions. It will make typing more specific and be cleaner in the
  // code.
  [action: string]: Function | string;
}

declare type UiActionType =
  'CHANGE_ACTIVE_LOCATION_ID' |
  'CREATE_PLANT_FAILURE' |
  'CREATE_PLANT_REQUEST' |
  'CREATE_PLANT_SUCCESS' |
  'DELETE_LOCATION_MEMBER' |
  'DELETE_LOCATION_WEATHER' |
  'DELETE_NOTE_FAILURE' |
  'DELETE_NOTE_REQUEST' |
  'DELETE_NOTE_SUCCESS' |
  'DELETE_PLANT_FAILURE' |
  'DELETE_PLANT_REQUEST' |
  'DELETE_PLANT_SUCCESS' |
  'EDIT_NOTE_CHANGE' |
  'EDIT_NOTE_CLOSE' |
  'EDIT_NOTE_OPEN' |
  'EDIT_PLANT_CHANGE' |
  'EDIT_PLANT_CLOSE' |
  'EDIT_PLANT_OPEN' |
  'UPSERT_LOCATION_MEMBER' |
  'LOAD_LOCATIONS_FAILURE' |
  'LOAD_LOCATIONS_REQUEST' |
  'LOAD_LOCATIONS_SUCCESS' |
  'LOAD_NOTES_FAILURE' |
  'LOAD_NOTES_REQUEST' |
  'LOAD_NOTES_SUCCESS' |
  'LOAD_PLANT_FAILURE' |
  'LOAD_PLANT_REQUEST' |
  'LOAD_PLANT_SUCCESS' |
  'LOAD_PLANTS_FAILURE' |
  'LOAD_PLANTS_REQUEST' |
  'LOAD_PLANTS_SUCCESS' |
  'LOAD_UNLOADED_PLANTS_FAILURE' |
  'LOAD_UNLOADED_PLANTS_REQUEST' |
  'LOAD_UNLOADED_PLANTS_SUCCESS' |
  'LOAD_USER_FAILURE' |
  'LOAD_USER_REQUEST' |
  'LOAD_USER_SUCCESS' |
  'LOAD_USERS_FAILURE' |
  'LOAD_USERS_REQUEST' |
  'LOAD_USERS_SUCCESS' |
  'LOGOUT_FAILURE' |
  'LOGOUT_REQUEST' |
  'LOGOUT_SUCCESS' |
  'MODIFY_LOCATION_FAILURE' |
  'MODIFY_LOCATION_REQUEST' |
  'MODIFY_LOCATION_SUCCESS' |
  'SHOW_NOTE_IMAGES' |
  'UPSERT_LOCATION_WEATHER' |
  'UPDATE_PLANT_FAILURE' |
  'UPDATE_PLANT_REQUEST' |
  'UPDATE_PLANT_SUCCESS' |
  'UPSERT_NOTE_FAILURE' |
  'UPSERT_NOTE_REQUEST' |
  'UPSERT_NOTE_SUCCESS';

interface UiActionsNextEnum {
  // TODO: Work out how to get the commented line below to work
  // [key in UiActionType]: string;
  [key:string]: string;
}

interface UiActionsNextFunction {
  [key:string]: ActionMethod;
}

interface UiActionsAcc {
  enum: UiActionsNextEnum;
  func: UiActionsNextFunction;
}