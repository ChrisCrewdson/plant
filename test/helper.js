const _ = require('lodash');
const request = require('request');
const constants = require('../app/libs/constants');
const mongo = require('../lib/db/mongo')();
const { makeMongoId } = require('../app/libs/utils');

let fakePassport;

jest.mock('passport', () => {
  // eslint-disable-next-line global-require
  const FakePassport = require('./fake-passport');
  const mockFakePassport = new FakePassport();
  fakePassport = mockFakePassport;
  return mockFakePassport;
});

// eslint-disable-next-line no-param-reassign, global-require
const serverModule = require('../lib/server');

const data = {};

function getUrl(url) {
  if ((url || '').startsWith('http')) {
    return url;
  }

  const { port } = data;
  if (!port) {
    throw new Error(`Jest Worker Id is ${process.env.JEST_WORKER_ID} and port is not defined in data object: ${JSON.stringify(data, null, 2)}`);
  }

  return `${'http'}://127.0.0.1:${port}${url}`;
}

let jwt;
async function makeRequest(opts) {
  const auth = opts.authenticate
    ? { Authorization: `Bearer ${jwt}` }
    : {};

  const headers = Object.assign(
    {},
    opts.headers || {},
    auth,
  );

  const followRedirect = opts.followRedirect || false;

  const options = Object.assign(
    {},
    opts,
    { url: getUrl(opts.url) },
    { headers },
    { followRedirect },
  );

  // cb will get (error, httpMsg, response);
  return new Promise((resolve, reject) => {
    request(options, (err, httpMsg, response) => {
      if (err) {
        return reject(err);
      }
      return resolve({ httpMsg, response });
    });
  });
}

async function startServerAuthenticated() {
  const port = 3000 + parseInt(process.env.JEST_WORKER_ID, 10);
  async function emptyDatabase() {
    const db = await mongo.GetDb();
    const promises = ['user', 'location', 'plant', 'note'].map((collection) => {
      const coll = db.collection(collection);
      return coll.deleteMany({});
    });
    return Promise.all(promises);
  }

  async function createUser() {
    const fbUser = {
      facebook: {
        id: makeMongoId(),
        gender: 'male',
        link: 'https://www.facebook.com/app_scoped_user_id/1234567890123456/',
        locale: 'en_US',
        last_name: 'Smith', // eslint-disable-line camelcase
        first_name: 'John', // eslint-disable-line camelcase
        timezone: -7,
        updated_time: '2015-01-29T23:11:04+0000', // eslint-disable-line camelcase
        verified: true,
      },
      name: 'John Smith',
      email: 'test@test.com',
      createdAt: '2016-01-28T14:59:32.989Z',
      updatedAt: '2016-01-28T14:59:32.989Z',
    };

    const user = await mongo.findOrCreateUser(fbUser, global.loggerMock);

    expect(user).toBeTruthy();
    expect(user._id).toBeTruthy();
    expect(constants.mongoIdRE.test(user._id)).toBe(true);
    expect(constants.mongoIdRE.test(user.locationIds[0]._id)).toBe(true);

    const expectedUser = {
      facebook: fbUser.facebook,
      name: 'John Smith',
      email: 'test@test.com',
      createdAt: '2016-01-28T14:59:32.989Z',
      updatedAt: '2016-01-28T14:59:32.989Z',
      _id: user._id,
      locationIds: [
        {
          _id: user.locationIds[0]._id,
          createdBy: user._id,
          members: {
            [user._id]: 'owner',
          },
          stations: {},
          title: 'John Smith Yard',
          plantIds: [],
        },
      ],
    };

    expect(user).toEqual(expectedUser);

    return user;
  }

  function createPassport(user) {
    fakePassport.setUser(user);
  }

  function createServer(server) {
    return server || serverModule;
  }

  function startServer(app, server) {
    if (app) {
      return app;
    }
    return server(port); // returns a Promise
  }

  async function authenticateUser() {
    const { httpMsg } = await makeRequest({
      url: '/auth/facebook/callback',
    });
    expect(httpMsg.headers).toBeTruthy();
    expect(httpMsg.headers.location).toBeTruthy();
    const parts = httpMsg.headers.location.split('=');
    [, jwt] = parts; // 2nd element is jwt
    // logger.trace('Test jwt:', {jwt});
    expect(jwt).toBeTruthy();
    // eslint-disable-next-line no-param-reassign
    return fakePassport.getUserId();
  }

  try {
    await emptyDatabase();
    data.user = await createUser();
    createPassport(data.user);
    data.port = port;
    data.server = createServer(data.server);
    data.app = await startServer(data.app, data.server, data.port);
    data.userId = await authenticateUser();
    return data;
  } catch (error) {
    throw error;
  }
}

async function createPlants(numPlants, userId, locationId) {
  const plantTemplate = {
    title: 'Plant Title',
    userId,
    locationId,
  };

  async function createPlant(count) {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: Object.assign({}, plantTemplate, { title: `${plantTemplate.title} ${count}` }),
      json: true,
      url: '/api/plant',
    };

    const { httpMsg, response: plant } = await makeRequest(reqOptions);
    expect(httpMsg.statusCode).toBe(200);

    expect(plant.title).toBeTruthy();

    return plant;
  }

  // generate some plants
  const promises = [...Array(numPlants).keys()].map(a => createPlant(a));
  return Promise.all(promises);
}

async function createNote(plantIds, noteOverride = {}) {
  expect(_.isArray(plantIds)).toBeTruthy();
  const noteTemplate = Object.assign(
    {
      note: 'This is a note',
      date: 20160101,
    },
    { plantIds },
    noteOverride,
  );

  const reqOptions = {
    method: 'POST',
    authenticate: true,
    body: noteTemplate,
    json: true,
    url: '/api/note',
  };

  const { httpMsg, response } = await makeRequest(reqOptions);
  expect(httpMsg.statusCode).toBe(200);
  expect(response.success).toBe(true);
  const { note } = response;
  expect(note._id).toBeTruthy();

  return response;
}

module.exports = {
  createNote,
  createPlants,
  getUrl,
  makeRequest,
  startServerAuthenticated,
};
