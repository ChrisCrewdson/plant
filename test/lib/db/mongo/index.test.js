const _ = require('lodash');

const constants = require('../../../../app/libs/constants');
const helper = require('../../../helper');
const mongo = require('../../../../lib/db/mongo')();
const googleOAuth = require('../../../fixtures/google-oauth');

const { id: googleId } = googleOAuth['www.googleapis.com'].result;

describe('/lib/db/mongo/', () => {
  let userId;
  let fbUser;
  let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    fbUser = data.user;
    userId = fbUser._id;
    expect(userId).toBeTruthy();
    [locationId] = data.user.locationIds;
    expect(typeof userId).toBe('string');
    expect(locationId).toBeTruthy();
    Object.freeze(fbUser);
  });

  describe('user', () => {
    test(
      'should fail to create a user account if there is no object',
      async () => {
        try {
          await mongo.findOrCreateUser(null, global.loggerMock);
        } catch (err) {
          expect(err).toBeTruthy();
          expect(err.message).toBe('No facebook.id or google.id:');
        }
        // 2 here,
        // 2 in beforeAll(),
        // 6 in helper.startServerAuthenticated from beforeAll.
        // 8 in calls to logger
        // 8 in calls to lalog logger
        expect.assertions(26);
      },
    );

    test('should fetch the user created in the before setup', async () => {
      const user = {
        google: {
          id: googleId,
        },
      };
      const body = await mongo.findOrCreateUser(user, global.loggerMock);
      expect(body).toBeTruthy();
      expect(body._id).toBeTruthy();
      expect(constants.mongoIdRE.test(body._id)).toBeTruthy();
      expect(constants.mongoIdRE.test(body.locationIds[0]._id)).toBeTruthy();
      delete body._id;
      delete body.locationIds;
      expect(body).toMatchSnapshot({
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test('should fetch all users', async () => {
      const body = await mongo.getAllUsers(global.loggerMock);
      expect(body).toBeTruthy();
      expect(_.isArray(body)).toBeTruthy();
      expect(body).toHaveLength(1);
      const user = body[0];
      expect(user._id).toBeTruthy();
      expect(constants.mongoIdRE.test(user._id)).toBeTruthy();
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
      expect(typeof plant.userId).toBe('string');
      const body = await mongo.createPlant(plant, userId, global.loggerMock);
      expect(body).toBeTruthy();
      expect(body._id).toBeTruthy();
      expect(typeof body._id).toBe('string');
      expect(typeof body.userId).toBe('string');
      expect(typeof plant.userId).toBe('object');
      expect(typeof plant.plantedOn).toBe('number');

      // To be used in next test...
      plantId = body._id;
    });

    test('should get an existing plant', async () => {
      const result = await mongo.getPlantById(plantId, userId, global.loggerMock);
      expect(typeof result.userId).toBe('string');
      expect(result.name).toBe(plant.name);
      expect(result.plantedOn).toBe(plant.plantedOn);
      expect(result.userId).toBe(plant.userId.toString());
    });

    test('should get existing plants', async () => {
      const results = await mongo.getPlantsByIds([plantId], userId, global.loggerMock);
      expect(_.isArray(results)).toBeTruthy();
      expect(results).toHaveLength(1);
      const result = results[0];
      expect(typeof result.userId).toBe('string');
      expect(result.name).toBe(plant.name);
      expect(result.plantedOn).toBe(plant.plantedOn);
      expect(result.userId).toBe(plant.userId.toString());
    });

    test('should update an existing plant with "Set"', async () => {
      const plantUpdate = {
        name: 'New Name',
        other: 'Other Text',
        _id: plantId,
        userId,
      };

      const result = await mongo.updatePlant(plantUpdate, userId, global.loggerMock);
      expect(result).toEqual(plantUpdate);
    });
  });
});
