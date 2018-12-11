const _ = require('lodash');
const nodeFetch = require('node-fetch');
// fetch-cookie wraps nodeFetch and preserves cookies.
// @ts-ignore - cannot find import
const fetch = require('fetch-cookie/node-fetch')(nodeFetch);

const { mockLogger } = require('./mock-logger');
const mongo = require('../lib/db/mongo')();

const serverModule = require('../lib/server');

/** @type {HelperData} */
const data = {};

/**
 *
 * @param {string} url
 * @returns
 */
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
 * @param {string} method
 */
const isPutOrPost = (method) => {
  const methodLower = method.toLowerCase();
  return methodLower === 'put' || methodLower === 'post';
};

/**
 * @param {HelperMakeRequestOptions} opts
 */
async function makeRequest(opts) {
  // fetch is fetch-cookie which will manage the authenticated session cookie.
  // nodeFetch is plain fetch that will not have a cookie.
  /** @type {import('node-fetch').default}} */
  const fetcher = opts.authenticate ? fetch : nodeFetch;

  const headers = Object.assign(
    {},
    opts.headers || {},
  );

  /** @type {import('node-fetch').RequestRedirect}} */
  const redirect = opts.followRedirect ? 'follow' : 'manual';

  const url = getUrl(opts.url);
  const options = Object.assign({}, opts, { headers, redirect });
  let body = '';
  if (isPutOrPost(options.method || '')) {
    body = JSON.stringify(options.body);
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
  }

  /** @type {import('node-fetch').RequestInit}} */
  const nodeFetchOptions = {
    headers: options.headers,
    method: options.method,
    redirect,
  };
  if (body) {
    nodeFetchOptions.body = body;
  }

  /** @type {import('node-fetch').Response}} */
  const response = await fetcher(url, nodeFetchOptions);
  const httpMsg = await (opts.text ? response.text() : response.json());
  return { response, httpMsg };
}

/** @type {import('net').Server|undefined} */
let localServer;

/**
 * Starts an authenticated server
 * @returns {Promise<HelperData>}
 */
async function startServerAuthenticated() {
  const port = 3000 + parseInt(process.env.JEST_WORKER_ID || '1', 10);
  async function emptyDatabase() {
    const db = await mongo.GetDb(mockLogger);
    const promises = ['user', 'location', 'plant', 'note'].map((collection) => {
      const coll = db.collection(collection);
      return coll.deleteMany({});
    });
    return Promise.all(promises);
  }

  /**
   *
   *
   * @param {import('net').Server|undefined} app
   * @param {*} server
   * @returns {Promise<import('net').Server>}
   */
  function startServer(app, server) {
    if (app) {
      // @ts-ignore - [ts] Type 'Server' is missing the following properties from type
      // 'Promise<Server>': then, catch, [Symbol.toStringTag], finally [2739]
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
    data.server = data.server || serverModule;
    data.app = await startServer(data.app, data.server);
    localServer = data.app;

    await googleAuthCallback();

    // Now, after the googleAuthCallback(), there should be a single document in the
    // user collection in the DB. This is the test user.
    const users = await mongo.getUserByQuery({
      email: 'johnsmith@gmail.com',
    }, mockLogger);
    expect(users).toBeInstanceOf(Array);
    expect(users).toHaveLength(1);
    const [user] = users;
    expect(user._id).toBeTruthy();
    data.userId = user._id.toString();

    // Now get the user from the DB again but use the getUserById() method because
    // this also adds the user's locations to the object. This is terrible and needs
    // to be fixed!!
    data.user = await mongo.getUserById(data.userId, mockLogger);

    return data;
  } catch (error) {
    throw error;
  }
}

const stopServer = async () => new Promise((resolve, reject) => {
  if (localServer) {
    localServer.close(
      /** @param {Error|undefined|null} err */
      err => (err ? reject(err) : resolve()));
  }
});

/**
 * Create a bunch of plants in the plant collection for testing
 * @param {number} numPlants - Number of plants to insert in plant collection for this user
 * @param {string} userId - User Id of user to create plants for
 * @param {string} locationId - Location Id at which to create the plants
 * @returns {Promise}
 */
async function createPlants(numPlants, userId, locationId) {
  const plantTemplate = {
    title: 'Plant Title',
    userId,
    locationId,
  };

  /**
   * createPlant
   * @param {number} count - the plant number/id being created not the number of plants to create
   * @returns {Promise<BizPlant>}
   */
  async function createPlant(count) {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: Object.assign({}, plantTemplate, { title: `${plantTemplate.title} ${count}` }),
      json: true,
      url: '/api/plant',
    };

    const { httpMsg, response } = await makeRequest(reqOptions);
    /** @type {BizPlant} */
    const plant = httpMsg;

    expect(response.status).toBe(200);
    expect(plant.title).toBeTruthy();

    return plant;
  }

  // generate some plants
  /** @type {number[]} */
  // @ts-ignore - [ts] Type 'IterableIterator<number>' is not an array type.
  const numbers = [...Array(numPlants).keys()];
  const promises = numbers.map(a => createPlant(a));
  return Promise.all(promises);
}

/**
 *
 * @param {string[]} plantIds
 * @param {object} noteOverride
 */
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

  /** @type {HelperMakeRequestOptions} */
  const reqOptions = {
    method: 'POST',
    authenticate: true,
    body: noteTemplate,
    text: false,
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
  stopServer,
  mockLogger,
};
