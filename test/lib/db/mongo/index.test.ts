import _ from 'lodash';

import { getDbInstance } from '../../../../lib/db/mongo';
import { requests } from '../../../fixtures/google-oauth';
import * as helper from '../../../helper';
import * as constants from '../../../../app/libs/constants';
import { mockLogger } from '../../../mock-logger';
import { UserDetails } from '../../../../lib/db/mongo/db-types';

const mongo = getDbInstance();
const googleOAuth = requests;

const { id: googleId } = googleOAuth['www.googleapis.com'].result;

describe('/lib/db/mongo/', () => {
  let userId: string;
  let fbUser;
  let locationId: string;

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
  afterAll(() => helper.stopServer());

  describe('user', () => {
    test(
      'should fail to create a user account if there is no object',
      async () => {
        try {
          const userDetails = null as unknown as UserDetails;
          await mongo.findOrCreateUser(userDetails, mockLogger);
        } catch (err) {
          expect(err).toBeTruthy();
          expect(err.message).toBe('No facebook.id or google.id:\nnull');
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
      const body = await mongo.findOrCreateUser(user, mockLogger);
      expect(body).toBeInstanceOf(Object);
      expect(body._id).toBeTruthy();
      expect(constants.mongoIdRE.test(body._id)).toBe(true);
      const { locationIds } = body;
      expect(locationIds).toBeTruthy();
      if (locationIds) {
        const [bodyLocationId] = locationIds;
        expect(constants.mongoIdRE.test(bodyLocationId)).toBe(true);
      }

      expect(body).toMatchSnapshot({
        locationIds: expect.any(Array),
        _id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    test('should fetch all users', async () => {
      const body = await mongo.getAllUsers(mockLogger);
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
      locationId,
      title: 'Plant Name',
      plantedOn: 20150701,
      userId,
    };
    let plantId: string;

    beforeAll(() => {
      plant.locationId = locationId;
    });

    test('should create a plant', async () => {
      plant.userId = userId;
      expect(typeof plant.userId).toBe('string');
      const body = await mongo.createPlant(plant, userId, mockLogger);
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
      const result = await mongo.getPlantById(plantId, userId, mockLogger);
      if (result) {
        expect(typeof result.userId).toBe('string');
        expect(result.title).toBe(plant.title);
        expect(result.plantedOn).toBe(plant.plantedOn);
        expect(result.userId).toBe(plant.userId.toString());
      }
      expect.assertions(4);
    });

    test('should get existing plants', async () => {
      const results: BizPlant[] = (
        await mongo.getPlantsByIds([plantId], userId, mockLogger)
      ) as BizPlant[];
      expect(_.isArray(results)).toBeTruthy();
      expect(results).toHaveLength(1);
      if (Array.isArray(results)) {
        const result = results[0];
        expect(typeof result.userId).toBe('string');
        expect(result.title).toBe(plant.title);
        expect(result.plantedOn).toBe(plant.plantedOn);
        expect(result.userId).toBe(plant.userId.toString());
      }
    });

    test('should update an existing plant with "Set"', async () => {
      const plantUpdate = {
        _id: plantId,
        locationId,
        other: 'Other Text',
        title: 'New Name',
        userId,
      } as BizPlant;

      const result = await mongo.updatePlant(plantUpdate, userId, mockLogger);
      expect(result).toEqual(plantUpdate);
    });
  });
});
