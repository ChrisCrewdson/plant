const _ = require('lodash');

const nodeFetch = require('node-fetch');
// fetch-cookie wraps nodeFetch and preserves cookies.
const fetch = require('fetch-cookie/node-fetch')(nodeFetch);

const mongo = require('../lib/db/mongo')();

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

/**
 * Is the method a PUT or a POST?
 * @param {Object} options
 * @param {String} options.method
 */
const isPutOrPost = (options) => {
  const method = (options.method || '').toLowerCase();
  return method === 'put' || method === 'post';
};

async function makeRequest(opts) {
  // fetch is fetch-cookie which will manage the authenticated session cookie.
  // nodeFetch is plain fetch that will not have a cookie.
  const fetcher = opts.authenticate ? fetch : nodeFetch;

  const headers = Object.assign(
    {},
    opts.headers || {},
  );

  const redirect = opts.followRedirect ? 'follow' : 'manual';

  const url = getUrl(opts.url);
  const options = Object.assign({}, opts, { headers, redirect });
  if (isPutOrPost(options)) {
    options.body = JSON.stringify(options.body);
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
  }

  const response = await fetcher(url, options);
  const httpMsg = await (opts.text ? response.text() : response.json());
  return { response, httpMsg };
}

async function startServerAuthenticated() {
  const port = 3000 + parseInt(process.env.JEST_WORKER_ID, 10);
  async function emptyDatabase() {
    const db = await mongo.GetDb(global.loggerMock);
    const promises = ['user', 'location', 'plant', 'note'].map((collection) => {
      const coll = db.collection(collection);
      return coll.deleteMany({});
    });
    return Promise.all(promises);
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

  const googleAuthCallback = async () => {
    const path = '/auth/google/callback?code=testing-code';
    const url = getUrl(path);
    const options = { url, text: true, authenticate: true };
    const { response } = await makeRequest(options);
    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    const expectedLocation = getUrl('/');
    expect(location).toBe(expectedLocation);
  };

  try {
    await emptyDatabase();
    data.port = port;
    data.server = createServer(data.server);
    data.app = await startServer(data.app, data.server, data.port);

    await googleAuthCallback();

    // Now, after the googleAuthCallback(), there should be a single document in the
    // user collection in the DB. This is the test user.
    const users = await mongo.getUserByQuery({
      email: 'johnsmith@gmail.com',
    });
    expect(users).toBeInstanceOf(Array);
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user._id).toBeTruthy();
    data.userId = user._id.toString();

    // Now get the user from the DB again but use the getUserById() method because
    // this also adds the user's locations to the object. This is terrible and needs
    // to be fixed!!
    data.user = await mongo.getUserById(data.userId, global.loggerMock);

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a bunch of plants in the plant collection for testing
 * @param {Number} numPlants - Number of plants to insert in plant collection for this user
 * @param {String} userId - User Id of user to create plants for
 * @param {String} locationId - Location Id at which to create the plants
 * @returns {Promise}
 */
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

    const { httpMsg: plant, response } = await makeRequest(reqOptions);
    expect(response.status).toBe(200);

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
  expect(response.status).toBe(200);
  expect(httpMsg.success).toBe(true);
  const { note } = httpMsg;
  expect(note._id).toBeTruthy();

  return httpMsg;
}

module.exports = {
  createNote,
  createPlants,
  getUrl,
  makeRequest,
  startServerAuthenticated,
};
