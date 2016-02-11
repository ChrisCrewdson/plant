import * as helper from '../../helper';
import assert from 'assert';

import d from 'debug';
const debug = d('plant:test.plants-api');

describe('plants-api', function() {
  this.timeout(10000);
  let userId;

  before('it should start the server and setup auth token', done => {
    helper.startServerAuthenticated((err, data) => {
      assert(data.userId);
      userId = data.userId;
      done();
    });
  });

  before('it should clear all plants for this user from DB', done => {
    helper.deleteAllPlantsForUser(done);
  });

  let insertedPlants;
  const numPlants = 2;

  before('should create multiple plants to use in test', done => {
    helper.createPlants(numPlants, userId, (err, plants) => {
      insertedPlants = plants;
      done();
    });
  });

  it('should return an empty list if userId exists and has no plants');

  it('should retrieve the just created plants by userId', done => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plants/${userId}`
    };

    helper.makeRequest(reqOptions, (error, httpMsg, response) => {
      // debug(response);
      // response should look like:
      // ?
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);
      assert(response);
      assert.equal(response.length, numPlants);
      // assert that all plants exist
      insertedPlants.forEach( plant => {
        const some = response.some( r => {
          return r._id === plant._id;
        });
        assert(some);
      });
      // assert(response.userId);
      // assert.equal(response._id, plantId);
      // assert.equal(response.title, initialPlant.title);
      // assert.equal(response.type, 'plant');

      done();
    });

  });

  describe('failures', () => {
    it.skip('should get a 404 if there is no userId', done => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plants`
      };

      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        debug('error:', error);
        debug('httpMsg:', httpMsg.statusCode);
        debug('response:', response);
        assert(!error);
        assert.equal(httpMsg.statusCode, 404);
        assert(!response);

        done();
      });
    });

    it('should fail to retrieve any plants if the userId does not exist', done => {
      const reqOptions = {
        method: 'GET',
        authenticate: false,
        json: true,
        url: `/api/plants/does-not-exist`
      };
      helper.makeRequest(reqOptions, (error, httpMsg, response) => {
        // debug(response);

        assert(!error);
        assert.equal(httpMsg.statusCode, 404);
        assert(!response);
        // assert.equal(response.error, 'missing');

        done();
      });
    });
  });

});
