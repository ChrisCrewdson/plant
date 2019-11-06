import { produce } from 'immer';
import { locations } from '../../../app/reducers/locations';
import { actionFunc } from '../../../app/actions';

describe('/app/reducers/locations', () => {
  const stateA = produce({}, () => ({
    1: {
      _id: '1',
      plantIds: ['one'],
    },
    2: {
      _id: '2',
      name: 'xxx',
      plantIds: ['xxx'],
    },
    3: {
      _id: '3',
    },
  })) as unknown as Record<string, UiLocationsValue>;

  test('should load locations', () => {
    const payload = [{
      _id: '2',
      name: 'twenty-two',
      plantIds: ['two', 'twenty'],
    }, {
      _id: '3',
      name: 'thirty-three',
      plantIds: ['three', 'thirty'],
    }, {
      _id: '4',
      name: 'four',
    }];

    const actual = locations(stateA, actionFunc.loadLocationsSuccess(payload));
    expect(actual).toMatchSnapshot();
  });

  test('should load locations with undefined payload', () => {
    const actual = locations(stateA, actionFunc.loadLocationsSuccess(undefined));
    expect(actual).toMatchSnapshot();
    // The same object should be returned
    expect(actual).toBe(stateA);
  });

  test('should handle a createPlantRequest for an existing plant at location', () => {
    const plant = {
      locationId: '1',
      _id: 'plant-1',
    };
    const actual = locations(stateA, actionFunc.createPlantRequest(plant));
    expect(actual).toMatchSnapshot();
    expect(actual).not.toBe(stateA);
  });

  test('should handle a createPlantRequest for a missing plant at location', () => {
    const plant = {
      locationId: '7',
      _id: 'plant-1',
    };
    const actual = locations(stateA, actionFunc.createPlantRequest(plant));
    expect(actual).toMatchSnapshot();
    expect(actual).toBe(stateA);
  });

  test('should handle a createPlantRequest when location does not have plantIds', () => {
    const plant = {
      locationId: '3',
      _id: 'plant-1',
    };
    const actual = locations(stateA, actionFunc.createPlantRequest(plant));
    expect(actual).toMatchSnapshot();
    expect(actual).not.toBe(stateA);
  });

  test('should handle a loadPlantsSuccess for an array of plants', () => {
    const plants = [{
      locationId: '1',
      _id: 'plant-1',
    }, { // include a duplicate to make sure it doesn't end up in state
      locationId: '1',
      _id: 'plant-1',
    }, {
      locationId: '7',
      _id: 'plant-7',
    }, {
      locationId: '1',
      _id: 'one', // a duplicate from stateA
    }];
    const actual = locations(stateA, actionFunc.loadPlantsSuccess(plants));
    expect(actual).toMatchSnapshot();
  });

  test('should handle a loadPlantsSuccess for an empty array of plants', () => {
    const plants: UiPlantsValue[] = [];
    const actual = locations(stateA, actionFunc.loadPlantsSuccess(plants));
    expect(actual).toMatchSnapshot();
    expect(actual).toBe(stateA);
  });

  test('should handle a deletePlantRequest', () => {
    const deletePlant = {
      locationId: '1',
      plantId: 'one',
    };
    const actual = locations(stateA, actionFunc.deletePlantRequest(deletePlant));
    expect(actual).toMatchSnapshot();
  });

  test('should handle a deletePlantRequest when locationId is missing', () => {
    const deletePlant = {
      locationId: '7',
      plantId: 'one',
    };
    const actual = locations(stateA, actionFunc.deletePlantRequest(deletePlant));
    expect(actual).toMatchSnapshot();
    expect(actual).toBe(stateA);
  });
});
