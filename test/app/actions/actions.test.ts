import { UiActionType, actionFunc, actionEnum } from '../../../app/actions';

describe('/app/actions', () => {
  test('should create a logout failure', (done) => {
    const actual = actionFunc.logoutFailure();
    expect(actual).toMatchSnapshot();
    done();
  });

  test('should create a logout request', (done) => {
    const actual = actionFunc.logoutRequest();
    expect(actual).toMatchSnapshot();
    done();
  });

  test('should create a logout success', (done) => {
    const actual = actionFunc.logoutSuccess();
    expect(actual).toMatchSnapshot();
    done();
  });

  test('should ensure that simplified actions has all of previous exports', () => {
    const isUpper = (letter: string) => letter >= 'A' && letter <= 'Z';
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
      'LOGOUT_FAILURE',
      'LOGOUT_REQUEST',
      'LOGOUT_SUCCESS',
      'MODIFY_LOCATION_FAILURE',
      'MODIFY_LOCATION_REQUEST',
      'MODIFY_LOCATION_SUCCESS',
      'UPDATE_PLANT_FAILURE',
      'UPDATE_PLANT_REQUEST',
      'UPDATE_PLANT_SUCCESS',
      'UPSERT_LOCATION_MEMBER',
      'UPSERT_LOCATION_WEATHER',
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
      'logoutFailure',
      'logoutRequest',
      'logoutSuccess',
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
      const firstLetter = exp[0];
      if (isUpper(firstLetter)) {
        const typedExp: UiActionType = exp as UiActionType;
        expect(typeof actionEnum[typedExp]).toBe('string');
      } else {
        expect(typeof actionFunc[exp]).toBe('function');
      }
    });
  });
});
