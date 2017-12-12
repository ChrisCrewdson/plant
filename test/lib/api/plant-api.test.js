const helper = require('../../helper');
const constants = require('../../../app/libs/constants');

// const logger = require('../../../lib/logging/logger').create('test.plant-api');

describe('plant-api', () => {
  let user;
  let plantId;
  let initialPlant;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated(3013);
    expect(data.userId).toBeTruthy();
    ({ user } = data);
    initialPlant = Object.freeze({
      title: 'Plant Title',
      price: 19.99,
      tags: ['north-east', 'citrus'],
      locationId: data.user.locationIds[0]._id,
    });
  });

  test(
    'should fail to create a plant record if user is not authenticated',
    async () => {
      const reqOptions = {
        method: 'POST',
        authenticate: false,
        body: initialPlant,
        json: true,
        url: '/api/plant',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(httpMsg.statusCode).toBe(401);
      expect(response).toBeTruthy();
      expect(response.error).toBe('Not Authenticated');
    },
  );

  test('should fail server validation if title is missing', async () => {
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
    expect(httpMsg.statusCode).toBe(400);
    expect(response).toBeTruthy();
    expect(response.title).toBe('Title is too short (minimum is 1 characters)');
  });

  test('should create a plant', async () => {
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
    expect(httpMsg.statusCode).toBe(200);
    expect(response).toBeTruthy();
    expect(response.title).toBe('Plant Title');
    expect(response.userId).toBe(user._id);
    expect(constants.mongoIdRE.test(response._id)).toBeTruthy();

    plantId = response._id;
  });

  test('should retrieve the just created plant', async () => {
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
    expect(httpMsg.statusCode).toBe(200);
    expect(response).toBeTruthy();
    expect(response.userId).toBeTruthy();
    expect(response._id).toBe(plantId);
    expect(response.title).toBe(initialPlant.title);
    expect(response.notes).toBeTruthy();
    expect(response.locationId).toBeTruthy();
    expect(response.notes).toHaveLength(0);
  });

  test('should fail to retrieve a plant if the id does not exist', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: '/api/plant/does-not-exist',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(httpMsg.statusCode).toBe(404);
    expect(response).toBeTruthy();
    expect(response.error).toBe('missing');
  });

  let updatedPlant;
  test('should update the just created plant', async () => {
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
    expect(httpMsg.statusCode).toBe(200);
    const expected = Object.assign({}, updatedPlant, { userId: user._id, locationId });
    expect(response).toEqual(expected);
  });

  test('should retrieve the just updated plant', async () => {
    const reqOptions = {
      method: 'GET',
      authenticate: false,
      json: true,
      url: `/api/plant/${plantId}`,
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(httpMsg.statusCode).toBe(200);
    expect(response).toBeTruthy();

    expect(response.userId).toBeTruthy();
    expect(response._id).toBe(plantId);
    expect(response.title).toBe(updatedPlant.title);
  });
});
