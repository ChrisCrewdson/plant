export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const helper = require('../../helper');

describe('plants-api', () => {
  let userId: string;
  let locationId: string;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    expect(data.user).toBeTruthy();
    expect(data.user._id).toBeTruthy();
    expect(data.user.locationIds).toBeTruthy();
    expect(data.user.locationIds.length).toBeTruthy();
    userId = data.user._id;
    [locationId] = data.user.locationIds;
    expect(locationId).toBeTruthy();
  });
  afterAll(() => helper.stopServer());

  let insertedPlants: BizPlant[];
  const numPlants = 2;

  beforeAll(async () => {
    const plants = await helper.createPlants(numPlants, userId, locationId);
    insertedPlants = plants;
  });

  describe('plants by locationId', () => {
    // it('should return an empty list if locationId exists and has no plants');

    test('should retrieve the just created plants by locationId', async () => {
      const reqOptions: HelperMakeRequestOptions = {
        method: 'GET',
        authenticate: false,
        url: `/api/plants/${locationId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      const plants: BizPlant[] = httpMsg;

      expect(response.status).toBe(200);
      expect(plants).toBeTruthy();

      expect(plants).toHaveLength(numPlants);
      // assert that all plants exist
      insertedPlants.forEach((plant) => {
        const some = plants.some((r) => r._id === plant._id);
        expect(some).toBe(true);
      });
    });
  });

  describe('failures', () => {
    test('should get a 404 if there is no locationId', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        text: true,
        url: '/api/plants',
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(404);
      expect(httpMsg).toBeTruthy();
    });

    test(
      'should fail to retrieve any plants if the locationId does not exist',
      async () => {
        const reqOptions = {
          method: 'GET',
          authenticate: false,
          text: true,
          url: '/api/plants/does-not-exist',
        };
        const { httpMsg, response } = await helper.makeRequest(reqOptions);
        expect(response.status).toBe(404);
        expect(!httpMsg).toBeTruthy();
      },
    );
  });
});
