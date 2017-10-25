const helper = require('../../helper');

const logger = require('../../../lib/logging/logger').create('test.plants-api');

describe('plants-api', () => {
  let userId;
  let locationId;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    expect(data.user).toBeTruthy();
    expect(data.user._id).toBeTruthy();
    expect(data.user.locationIds).toBeTruthy();
    expect(data.user.locationIds.length).toBeTruthy();
    userId = data.user._id;
    locationId = data.user.locationIds[0]._id;
  });


  let insertedPlants;
  const numPlants = 2;

  beforeAll(async () => {
    const plants = await helper.createPlants(numPlants, userId, locationId);
    insertedPlants = plants;
  });

  describe('plants by locationId', () => {
    // it('should return an empty list if locationId exists and has no plants');

    test('should retrieve the just created plants by locationId', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plants/${locationId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      logger.trace('response:', { response });
      expect(httpMsg.statusCode).toBe(200);
      expect(response).toBeTruthy();

      expect(response).toHaveLength(numPlants);
      // assert that all plants exist
      insertedPlants.forEach((plant) => {
        const some = response.some(r => r._id === plant._id);
        expect(some).toBeTruthy();
      });
    });
  });

  describe('failures', () => {
    test('should get a 404 if there is no locationId', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: '/api/plants',
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(httpMsg.statusCode).toBe(404);
      expect(response).toBeTruthy();
    });

    test(
      'should fail to retrieve any plants if the locationId does not exist',
      async () => {
        const reqOptions = {
          method: 'GET',
          authenticate: false,
          json: true,
          url: '/api/plants/does-not-exist',
        };
        const { httpMsg, response } = await helper.makeRequest(reqOptions);
        expect(httpMsg.statusCode).toBe(404);
        expect(!response).toBeTruthy();
      },
    );
  });
});
