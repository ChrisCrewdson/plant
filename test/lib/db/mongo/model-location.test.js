// TODO: Need to setup these two mocks in a setup script?
jest.mock('winston', () => ({
  add: () => {},
  log: () => {},
}));

// 1. jest.mock takes a function
// 2. debug returns a function that is used to initialize
// 3. debug initializer returns a function that's used for debugging
jest.mock('debug', () => () => () => {});

// const _ = require('lodash');
// const constants = require('../../../../app/libs/constants');
const helper = require('../../../helper');
const mongo = require('../../../../lib/db/mongo')();

describe('/lib/db/mongo/model-location', () => {
  let userId;
  let fbUser;
  // let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated(3017);
    fbUser = data.user;
    userId = fbUser._id;
    expect(userId).toBeTruthy();
    // locationId = data.user.locationIds[0]._id;
    expect(typeof userId).toBe('string');
    Object.freeze(fbUser);
  });

  describe('Create', () => {
    test('should fail to create a location if members and createdBy are missing', async () => {
      expect.hasAssertions();
      try {
        const loc = {};
        await mongo.createLocation(loc);
      } catch (e) {
        expect(e.message).toEqual('members and createdBy must be specified as part of location when creating a location');
      }
    });

    test('should fail to create a location if members and createdBy are missing', async () => {
      expect.hasAssertions();
      try {
        const loc = {
          createdBy: userId,
        };
        await mongo.createLocation(loc);
      } catch (e) {
        expect(e.message).toEqual('members and createdBy must be specified as part of location when creating a location');
      }
    });

    test('should fail to create a location if members and createdBy are missing', async () => {
      const loc = {
        createdBy: userId,
        members: {
          [userId]: 'owner',
        },
      };
      const actual = await mongo.createLocation(loc);
      const expected = {
        _id: actual._id,
        createdBy: userId,
        members: {
          [userId]: 'owner',
        },
      };
      expect(actual).toEqual(expected);
    });
  });

  // describe('Read', () => {});
  // describe('Update', () => {});
  // describe('Delete', () => {});
});
