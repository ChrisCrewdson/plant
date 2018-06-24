const helper = require('../../../helper');
const mongo = require('../../../../lib/db/mongo')();

describe('/lib/db/mongo/model-location', () => {
  let userId;
  let fbUser;
  // let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
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

    test('should fail to create a location if members is missing', async () => {
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

    test('should create a location if members and createdBy are present', async () => {
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
