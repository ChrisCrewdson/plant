import { produce } from 'immer';
import * as helper from '../../helper';
import * as constants from '../../../app/libs/constants';

describe('plant-api', () => {
  let user: BizUser;
  let plantId: string;
  let initialPlant: UiPlantsValue;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    expect(data.userId).toBeTruthy();
    ({ user } = data);
    initialPlant = Object.freeze({
      title: 'Plant Title',
      price: 19.99,
      locationId: data.user.locationIds[0],
    });
  });
  afterAll(() => helper.stopServer());

  test(
    'should fail to create a plant record if user is not authenticated',
    async () => {
      const reqOptions: helper.HelperMakeRequestOptions = {
        method: 'POST',
        authenticate: false,
        body: initialPlant,
        url: '/api/plant',
      };
      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(401);
      expect(httpMsg).toBeTruthy();
      expect(httpMsg.error).toBe('Not Authenticated');
    },
  );

  test('should fail server validation if title is missing', async () => {
    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'POST',
      authenticate: true,
      body: { ...initialPlant, title: '' },
      url: '/api/plant',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // httpMsg should look like:
    // { title: [ 'Title can\'t be blank' ] }
    // ...and status should be 400
    expect(response.status).toBe(400);
    expect(httpMsg).toBeTruthy();
    expect(httpMsg.title).toBe('Title is too short (minimum is 1 characters)');
  });

  test('should create a plant', async () => {
    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'POST',
      authenticate: true,
      body: initialPlant,
      url: '/api/plant',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // httpMsg should look like:
    // {  title: 'Plant Title',
    //    userId: '6d73133d02d14058ac5f86fa',
    //    _id: 'b19d854e0dc045feabd31b3b' }
    expect(response.status).toBe(200);
    expect(httpMsg).toBeTruthy();
    expect(httpMsg.title).toBe('Plant Title');
    expect(httpMsg.userId).toBe(user._id);
    expect(constants.mongoIdRE.test(httpMsg._id)).toBeTruthy();

    plantId = httpMsg._id;
  });

  test('should retrieve the just created plant', async () => {
    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'GET',
      authenticate: false,
      url: `/api/plant/${plantId}`,
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    // httpMsg should look like:
    // { _id: 'e5fc6fff0a8f48ad90636b3cea6e4f93',
    // title: 'Plant Title',
    // userId: '241ff27e28c7448fb22c4f6fb2580923'}
    expect(response.status).toBe(200);
    expect(httpMsg).toBeTruthy();
    expect(httpMsg.userId).toBeTruthy();
    expect(httpMsg._id).toBe(plantId);
    expect(httpMsg.title).toBe(initialPlant.title);
    expect(httpMsg.notes).toBeTruthy();
    expect(httpMsg.locationId).toBeTruthy();
    expect(httpMsg.notes).toHaveLength(0);
  });

  test('should fail to retrieve a plant if the id does not exist', async () => {
    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'GET',
      authenticate: false,
      url: '/api/plant/does-not-exist',
    };
    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(response.status).toBe(404);
    expect(httpMsg).toBeTruthy();
    expect(httpMsg.error).toBe('missing');
  });

  let updatedPlant: UiPlantsValue;
  test('should update the just created plant', async () => {
    updatedPlant = produce({}, () => ({
      ...initialPlant,
      title: 'A New Title',
      _id: plantId,
    }));

    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'PUT',
      authenticate: true,
      body: updatedPlant,
      url: '/api/plant',
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    const { locationId } = httpMsg;
    expect(response.status).toBe(200);
    const expected = {
      ...updatedPlant, userId: user._id, locationId, notes: [],
    };
    expect(httpMsg).toEqual(expected);
  });

  test('should retrieve the just updated plant', async () => {
    const reqOptions: helper.HelperMakeRequestOptions = {
      method: 'GET',
      authenticate: false,
      url: `/api/plant/${plantId}`,
    };

    const { httpMsg, response } = await helper.makeRequest(reqOptions);
    expect(response.status).toBe(200);
    expect(httpMsg).toBeTruthy();

    expect(httpMsg.userId).toBeTruthy();
    expect(httpMsg._id).toBe(plantId);
    expect(httpMsg.title).toBe(updatedPlant.title);
  });
});
