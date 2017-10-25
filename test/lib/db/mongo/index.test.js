// TODO: Need to setup these two mocks in a setup script?
jest.mock('loggly', () => ({
  createClient: () => () => {},
}));

// 1. jest.mock takes a function
// 2. debug returns a function that is used to initialize
// 3. debug initializer returns a function that's used for debugging
jest.mock('debug', () => () => () => {});

const _ = require('lodash');
const assert = require('assert');
const constants = require('../../../../app/libs/constants');
const helper = require('../../../helper');
const mongo = require('../../../../lib/db/mongo')();

describe('/lib/db/mongo/', () => {
  let userId;
  let fbUser;
  let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    fbUser = data.user;
    userId = fbUser._id;
    assert(userId);
    locationId = data.user.locationIds[0]._id;
    assert.equal(typeof userId, 'string');
    Object.freeze(fbUser);
  });

  describe('user', () => {
    test(
      'should fail to create a user account if there is no object',
      async () => {
        try {
          await mongo.findOrCreateUser(null);
          assert(false, 'findOrCreateUser() should have thrown in this test');
        } catch (err) {
          expect(err).toBeTruthy();
          assert.equal(err.message, 'No facebook.id or google.id:');
        }
      },
    );

    test('should fetch the user created in the before setup', async () => {
      const user = {
        facebook: {
          id: fbUser.facebook.id,
        },
      };
      const body = await mongo.findOrCreateUser(user);
      assert(body);
      assert(body._id);
      assert(constants.mongoIdRE.test(body._id));
      assert(constants.mongoIdRE.test(body.locationIds[0]._id));
      assert.deepStrictEqual(body, fbUser);
    });

    test('should fetch all users', async () => {
      const body = await mongo.getAllUsers();
      assert(body);
      assert(_.isArray(body));
      assert.equal(body.length, 1);
      const user = body[0];
      assert(user._id);
      assert(constants.mongoIdRE.test(user._id));
    });
  });

  describe('plant', () => {
    const plant = {
      name: 'Plant Name',
      plantedOn: 20150701,
    };
    let plantId;

    beforeAll(() => {
      plant.locationId = locationId;
    });

    test('should create a plant', async () => {
      plant.userId = userId;
      assert.equal(typeof plant.userId, 'string');
      const body = await mongo.createPlant(plant, userId);
      assert(body);
      assert(body._id);
      assert.equal(typeof body._id, 'string');
      assert.equal(typeof body.userId, 'string');
      assert.equal(typeof plant.userId, 'object');
      assert.equal(typeof plant.plantedOn, 'number');

      // To be used in next test...
      plantId = body._id;
    });

    test('should get an existing plant', async () => {
      const result = await mongo.getPlantById(plantId, userId);
      assert.equal(typeof result.userId, 'string');
      assert.equal(result.name, plant.name);
      assert.equal(result.plantedOn, plant.plantedOn);
      assert.equal(result.userId, plant.userId.toString());
    });

    test('should get existing plants', async () => {
      const results = await mongo.getPlantsByIds([plantId], userId);
      assert(_.isArray(results));
      assert.equal(results.length, 1);
      const result = results[0];
      assert.equal(typeof result.userId, 'string');
      assert.equal(result.name, plant.name);
      assert.equal(result.plantedOn, plant.plantedOn);
      assert.equal(result.userId, plant.userId.toString());
    });

    test('should update an existing plant with "Set"', async () => {
      const plantUpdate = {
        name: 'New Name',
        other: 'Other Text',
        _id: plantId,
        userId,
      };

      const result = await mongo.updatePlant(plantUpdate, userId);
      assert.deepEqual(result, plantUpdate);
    });
  });
});
