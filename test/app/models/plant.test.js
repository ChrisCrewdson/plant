const _ = require('lodash');
const validators = require('../../../app/models');

const { plant: plantValidator } = validators;

describe('/app/models/plant', () => {
  test('should pass minimum validation', () => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      locationId: 'cf885bf372488977ae0d6475',
      price: '$19.99', // should convert this to numeric 19.99
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    const transformed = plantValidator(plant, { isNew });
    expect(transformed.title).toBe(plant.title);
    expect(plantCopy).toEqual(plant);
    expect(transformed.price).toBe(19.99);
  });

  test('should pass full validation', () => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      botanicalName: 'Botanical Name',
      commonName: 'Common Name',
      description: 'Description',
      loc: { type: 'Plant', coordinates: [1.11, 2.22] },
      locationId: 'cf885bf372488977ae0d6475',
      plantedDate: 20121215,
      price: 25.99,
      purchasedDate: 20121215,
      tags: ['citrus', 'north-east'],
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    const transformed = plantValidator(plant, { isNew });
    expect(Object.keys(transformed)).toEqual(Object.keys(plant));

    // Issue 1403 - This expect is failing since switching over to Jest
    // because we were using deepEqual instead of deepStrictEqual when
    // using assert.
    // TODO: Need to solve issue 1403 before re-enabling this
    // expect(transformed).toEqual(plant);

    expect(plantCopy).toEqual(plant);
  });

  test('should fail validation', () => {
    // All items in plant should be invalid
    const plant = {
      _id: '0e55d91cb33d42', // Not a MongoId
      botanicalName: _.repeat('Botanical Name is too long', 50),
      commonName: true, // Not a string
      description: 500, // Not a string
      plantedDate: 121212, // Year is not 4 digits
      price: 'Not a number',
      purchasedDate: 20161313, // Invalid month
      tags: ['citrus', 'north-east', 'north', 'west', 'south', 'east'], // Tags not unique
      title: {}, // Not a string
      userId: 123, // Not a MongoId
      locationId: 789, // Not a MongoId
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    /* eslint-disable no-console */
    console.error = jest.fn();
    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();

      expect(err._id).toBe(' id is invalid');
      expect(err.botanicalName).toBe('Botanical name is too long (maximum is 100 characters)');
      expect(err.commonName).toBe('Common name has an incorrect length');
      expect(err.description).toBe('Description has an incorrect length');
      expect(err.plantedDate).toBe('Planted date must be after 1st Jan 1700');
      expect(err.price).toBe('Price is not a number');
      expect(err.purchasedDate).toBe('Acquire date must have a valid month, value found was 13');
      expect(err.tags).toBe('Tags can have a maximum of 5 tags');
      expect(err.title).toBe('Title has an incorrect length');
      expect(err.userId).toBe('User id is invalid');
      expect(err.locationId).toBe('Location id is invalid');
      expect(plantCopy).toEqual(plant);
      expect(console.error).toHaveBeenCalledTimes(3);
    }
    // @ts-ignore - mockReset does not existing on console.error
    console.error.mockReset();
    /* eslint-enable no-console */
    expect.assertions(14);
  });

  test('should strip out props not in the schema', () => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      fakeName1: 'Common Name',
      fakeName2: 'Description',
      locationId: 'cf885bf372488977ae0d6475',
      title: 'Title is required',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    const transformed = plantValidator(plant, { isNew });
    expect(Object.keys(transformed)).toHaveLength(4);
    expect(transformed._id).toBe(plant._id);
    expect(transformed.title).toBe(plant.title);
    expect(transformed.userId).toBe(plant.userId);
    // @ts-ignore - intentionally adding a non-existing property for testing
    expect(transformed.fakeName1).toBeFalsy();
    // @ts-ignore - intentionally adding a non-existing property for testing
    expect(transformed.fakeName2).toBeFalsy();
    expect(plantCopy).toEqual(plant);
  });

  test('should add _id if it is a new record', () => {
    const plant = {
      locationId: 'cf885bf372488977ae0d6475',
      title: 'Title is required',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = true;
    const transformed = plantValidator(plant, { isNew });
    expect(Object.keys(transformed)).toHaveLength(4);
    expect(transformed._id).toBeTruthy();
    expect(transformed.title).toBe(plant.title);
    expect(transformed.userId).toBe(plant.userId);
    expect(plantCopy).toEqual(plant);
  });

  test('should fail if userId is missing', (done) => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      locationId: 'cf885bf372488977ae0d6475',
      title: 'Title is required',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.userId).toBe('User id can\'t be blank');
      expect(plantCopy).toEqual(plant);
      done();
    }
  });

  test('should fail if locationId is missing', (done) => {
    /** @type {UiPlantsValue} */
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      userId: 'cf885bf372488977ae0d6475',
      title: 'Title is required',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.locationId).toBe('Location id can\'t be blank');
      expect(plantCopy).toEqual(plant);
      done();
    }
  });

  test('should fail if a tag element is over its maximum length', (done) => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      botanicalName: 'Botanical Name',
      commonName: 'Common Name',
      description: 'Description',
      locationId: 'cf885bf372488977ae0d6475',
      plantedDate: 20121215,
      price: 25.99,
      purchasedDate: 20121215,
      tags: ['citrus', '01234567890012345678901'],
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.tags).toBe('Tags cannot be more than 20 characters');
      expect(plantCopy).toEqual(plant);
      done();
    }
  });

  test('should fail if a tags is not an array', (done) => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      botanicalName: 'Botanical Name',
      commonName: 'Common Name',
      description: 'Description',
      locationId: 'cf885bf372488977ae0d6475',
      plantedDate: 20121215,
      price: 25.99,
      purchasedDate: 20121215,
      tags: 'citrus',
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.tags).toBe('Tags must be an array');
      expect(plantCopy).toEqual(plant);
      done();
    }
  });

  test('should fail if a tag element has invalid characters', (done) => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      botanicalName: 'Botanical Name',
      commonName: 'Common Name',
      description: 'Description',
      locationId: 'cf885bf372488977ae0d6475',
      plantedDate: 20121215,
      price: 25.99,
      purchasedDate: 20121215,
      tags: ['cit&rus'],
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    try {
      plantValidator(plant, { isNew });
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.tags).toBe('Tags can only have alphabetic characters and a dash');
      expect(plantCopy).toEqual(plant);
      done();
    }
  });

  test('should lowercase tags', () => {
    const plant = {
      _id: 'b33d420024432d67a3c7fb36',
      botanicalName: 'Botanical Name',
      commonName: 'Common Name',
      description: 'Description',
      locationId: 'cf885bf372488977ae0d6475',
      plantedDate: 20121215,
      price: 25.99,
      purchasedDate: 20121215,
      tags: ['CITRUS', 'North-West', 'upPer'],
      title: 'Title',
      userId: 'cf885bf372488977ae0d6476',
    };
    const plantCopy = _.cloneDeep(plant);

    const isNew = false;

    const transformed = plantValidator(plant, { isNew });
    expect(Object.keys(transformed)).toEqual(Object.keys(plant));
    expect(transformed.tags).toEqual(['citrus', 'north-west', 'upper']);
    expect(plantCopy).toEqual(plant);
  });
});
