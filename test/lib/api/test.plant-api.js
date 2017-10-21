const helper = require('../../helper');
const assert = require('assert');
const constants = require('../../../app/libs/constants');

// const logger = require('../../../lib/logging/logger').create('test.plant-api');

describe('plant-api', () => {
  let user;
  let plantId;
  let initialPlant;

  before(
    'it should start the server and setup auth token',
    async () => {
      const data = await helper.startServerAuthenticated();
      assert(data.userId);
      ({ user } = data);
      initialPlant = Object.freeze({
        title: 'Plant Title',
        price: 19.99,
        tags: ['north-east', 'citrus'],
        locationId: data.user.locationIds[0]._id,
      });
    },
  );

  it('should fail to create a plant record if user is not authenticated', async () => {
    const reqOptions = {
      method: 'POST',
      authenticate: false,
      body: initialPlant,
      json: true,
      url: '/api/plant',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    assert.equal(httpMsg.statusCode, 401);
    assert(response);
    assert.equal(response.error, 'Not Authenticated');
  });

  it('should fail server validation if title is missing', async () => {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: Object.assign({}, initialPlant, { title: '' }),
      json: true,
      url: '/api/plant',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // response should look like:
    // { title: [ 'Title can\'t be blank' ] }
    // ...and status should be 400
    assert.equal(httpMsg.statusCode, 400);
    assert(response);
    assert.equal(response.title, 'Title is too short (minimum is 1 characters)');
  });

  it('should create a plant', async () => {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: initialPlant,
      json: true,
      url: '/api/plant',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // response should look like:
    // {  title: 'Plant Title',
    //    userId: '6d73133d02d14058ac5f86fa',
    //    _id: 'b19d854e0dc045feabd31b3b' }
    assert.equal(httpMsg.statusCode, 200);
    assert(response);
    assert.equal(response.title, 'Plant Title');
    assert.equal(response.userId, user._id);
    assert(constants.mongoIdRE.test(response._id));

    plantId = response._id;
  });

  it('should retrieve the just created plant', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/${plantId}`,
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // response should look like:
    // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
    // title: 'Plant Title',
    // userId: '241ff27e28c7448fb22c4f6fb2580923'}
    assert.equal(httpMsg.statusCode, 200);
    assert(response);
    assert(response.userId);
    assert.equal(response._id, plantId);
    assert.equal(response.title, initialPlant.title);
    assert(response.notes);
    assert(response.locationId);
    assert.equal(response.notes.length, 0);
  });

  it('should fail to retrieve a plant if the id does not exist', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: '/api/plant/does-not-exist',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    assert.equal(httpMsg.statusCode, 404);
    assert(response);
    assert.equal(response.error, 'missing');
  });

  let updatedPlant;
  it('should update the just created plant', async () => {
    updatedPlant = Object.assign(
      {},
      initialPlant, {
        title: 'A New Title',
        _id: plantId,
      },
    );

    const reqOptions = {
      method: 'PUT',
      authenticate: true,
      body: updatedPlant,
      json: true,
      url: '/api/plant',
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    const { locationId } = response;
    assert.equal(httpMsg.statusCode, 200);
    const expected = Object.assign({}, updatedPlant, { userId: user._id, locationId });
    assert.deepEqual(response, expected);
  });

  it('should retrieve the just updated plant', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/${plantId}`,
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    assert.equal(httpMsg.statusCode, 200);
    assert(response);

    assert(response.userId);
    assert.equal(response._id, plantId);
    assert.equal(response.title, updatedPlant.title);
  });
});
