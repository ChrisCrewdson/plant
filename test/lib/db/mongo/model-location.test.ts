import { getDbInstance } from '../../../../lib/db/mongo';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const helper = require('../../../helper');

const mongo = getDbInstance();
const { mockLogger } = require('../../../mock-logger');

describe('/lib/db/mongo/model-location', () => {
  let userId: string;
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
  afterAll(() => helper.stopServer());

  describe('Create', () => {
    test('should fail to create a location if members, title and createdBy are missing', async () => {
      expect.hasAssertions();
      try {
        const loc = {};
        await mongo.createLocation(loc, mockLogger);
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });

    test('should fail to create a location if members is missing', async () => {
      expect.hasAssertions();
      try {
        const loc = {
          createdBy: userId,
        };
        await mongo.createLocation(loc, mockLogger);
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });

    test('should create a location if members, title and createdBy are present', async () => {
      const loc = {
        title: 'fake location title',
        createdBy: userId,
        members: {
          [userId]: 'owner',
        },
      };
      const actual = await mongo.createLocation(loc, mockLogger);
      const expected = {
        _id: actual._id,
        title: 'fake location title',
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
