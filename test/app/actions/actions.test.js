// const _ = require('lodash');
const actions = require('../../../app/actions');

describe('/app/actions', () => {
  test('should create a logout action', (done) => {
    const expected = {
      type: actions.LOGOUT,
    };
    const actual = actions.logout();
    expect(actual).toEqual(expected);
    done();
  });

  test('should create a login request action', (done) => {
    const payload = { one: 1, two: 2 };
    const expected = {
      type: actions.LOGIN_REQUEST,
      payload,
    };
    const actual = actions.loginRequest(payload);
    expect(actual).toEqual(expected);
    done();
  });

  test('should create a login failure action', (done) => {
    const payload = { one: 1, two: 2 };
    const expected = {
      type: actions.LOGIN_FAILURE,
      payload,
      error: true,
    };
    const actual = actions.loginFailure(payload);
    expect(actual).toEqual(expected);
    done();
  });

  test('should ensure that simplified actions has all of previous exports', () => {
    const isUpper = letter => letter >= 'A' && letter <= 'Z';
    const originalExports = [
      'CHANGE_ACTIVE_LOCATION_ID',
      'CREATE_PLANT_FAILURE',
      'CREATE_PLANT_REQUEST',
      'CREATE_PLANT_SUCCESS',
      'DELETE_LOCATION_MEMBER',
      'DELETE_LOCATION_WEATHER',
      'DELETE_NOTE_FAILURE',
      'DELETE_NOTE_REQUEST',
      'DELETE_NOTE_SUCCESS',
      'DELETE_PLANT_FAILURE',
      'DELETE_PLANT_REQUEST',
      'DELETE_PLANT_SUCCESS',
      'EDIT_NOTE_CHANGE',
      'EDIT_NOTE_CLOSE',
      'EDIT_NOTE_OPEN',
      'EDIT_PLANT_CHANGE',
      'EDIT_PLANT_CLOSE',
      'EDIT_PLANT_OPEN',
      'UPSERT_LOCATION_MEMBER',
      'LOAD_LOCATIONS_FAILURE',
      'LOAD_LOCATIONS_REQUEST',
      'LOAD_LOCATIONS_SUCCESS',
      'LOAD_NOTES_FAILURE',
      'LOAD_NOTES_REQUEST',
      'LOAD_NOTES_SUCCESS',
      'LOAD_PLANT_FAILURE',
      'LOAD_PLANT_REQUEST',
      'LOAD_PLANT_SUCCESS',
      'LOAD_PLANTS_FAILURE',
      'LOAD_PLANTS_REQUEST',
      'LOAD_PLANTS_SUCCESS',
      'LOAD_UNLOADED_PLANTS_FAILURE',
      'LOAD_UNLOADED_PLANTS_REQUEST',
      'LOAD_UNLOADED_PLANTS_SUCCESS',
      'LOAD_USER_FAILURE',
      'LOAD_USER_REQUEST',
      'LOAD_USER_SUCCESS',
      'LOAD_USERS_FAILURE',
      'LOAD_USERS_REQUEST',
      'LOAD_USERS_SUCCESS',
      'LOGIN_FAILURE',
      'LOGIN_REQUEST',
      'LOGIN_SUCCESS',
      'LOGOUT',
      'MODIFY_LOCATION_FAILURE',
      'MODIFY_LOCATION_REQUEST',
      'MODIFY_LOCATION_SUCCESS',
      'UPSERT_LOCATION_WEATHER',
      'UPDATE_PLANT_FAILURE',
      'UPDATE_PLANT_REQUEST',
      'UPDATE_PLANT_SUCCESS',
      'UPSERT_NOTE_FAILURE',
      'UPSERT_NOTE_REQUEST',
      'UPSERT_NOTE_SUCCESS',
      'changeActiveLocationId',
      'createPlantFailure',
      'createPlantRequest',
      'createPlantSuccess',
      'deleteNoteFailure',
      'deleteNoteRequest',
      'deleteNoteSuccess',
      'deletePlantFailure',
      'deletePlantRequest',
      'deletePlantSuccess',
      'editNoteChange',
      'editNoteClose',
      'editNoteOpen',
      'editPlantChange',
      'editPlantClose',
      'editPlantOpen',
      'loadLocationsFailure',
      'loadLocationsRequest',
      'loadLocationsSuccess',
      'loadNotesFailure',
      'loadNotesRequest',
      'loadNotesSuccess',
      'loadPlantFailure',
      'loadPlantRequest',
      'loadPlantsFailure',
      'loadPlantsRequest',
      'loadPlantsSuccess',
      'loadPlantSuccess',
      'loadUnloadedPlantsFailure',
      'loadUnloadedPlantsRequest',
      'loadUnloadedPlantsSuccess',
      'loadUserFailure',
      'loadUserRequest',
      'loadUsersFailure',
      'loadUsersRequest',
      'loadUsersSuccess',
      'loadUserSuccess',
      'loginFailure',
      'loginRequest',
      'loginSuccess',
      'logout',
      'modifyLocationFailure',
      'modifyLocationRequest',
      'modifyLocationSuccess',
      'updatePlantFailure',
      'updatePlantRequest',
      'updatePlantSuccess',
      'upsertNoteFailure',
      'upsertNoteRequest',
      'upsertNoteSuccess',
    ];
    originalExports.forEach((exp) => {
      const [firstLetter] = exp;
      if (isUpper(firstLetter)) {
        expect(typeof actions[exp]).toBe('string');
      } else {
        expect(typeof actions[exp]).toBe('function');
      }
    });
  });
});
