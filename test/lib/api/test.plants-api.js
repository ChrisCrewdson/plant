const helper = require('../../helper');
const assert = require('assert');

const logger = require('../../../lib/logging/logger').create('test.plants-api');

describe('plants-api', () => {
  let userId;
  let locationId;

  before('it should start the server and setup auth token', async () => {
    const data = await helper.startServerAuthenticated();
    assert(data.user);
    assert(data.user._id);
    assert(data.user.locationIds);
    assert(data.user.locationIds.length);
    userId = data.user._id;
    locationId = data.user.locationIds[0]._id;
  });


  let insertedPlants;
  const numPlants = 2;

  before('should create multiple plants to use in test', async () => {
    const plants = await helper.createPlants(numPlants, userId, locationId);
    insertedPlants = plants;
  });

  describe('plants by locationId', () => {
    // it('should return an empty list if locationId exists and has no plants');

    it('should retrieve the just created plants by locationId', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plants/${locationId}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      logger.trace('response:', { response });
      assert.equal(httpMsg.statusCode, 200);
      assert(response);

      assert.equal(response.length, numPlants);
      // assert that all plants exist
      insertedPlants.forEach((plant) => {
        const some = response.some(r => r._id === plant._id);
        assert(some);
      });
    });
  });

  describe('failures', () => {
    it('should get a 404 if there is no locationId', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: '/api/plants',
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 404);
      assert(response);
    });

    it('should fail to retrieve any plants if the locationId does not exist', async () => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: '/api/plants/does-not-exist',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 404);
      assert(!response);
    });
  });
});
