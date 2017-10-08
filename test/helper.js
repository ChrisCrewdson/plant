const _ = require('lodash');
const assert = require('assert');
const constants = require('../app/libs/constants');
// const FakePassport = require('./fake-passport');
const mongo = require('../lib/db/mongo');
const request = require('request');
const { makeMongoId } = require('../app/libs/utils');

const fakePassport = jest.mock('passport', () => new (function FakePassport() {
  this.setUser = (user) => {
    this.user = user;
  };

  this.getUserId = () => this.user._id;

  this.initialize = () =>
    (req, res, next) => {
      next();
    }
  ;

  this.authenticate = (type, cb) => {
    if (cb) {
      const err = null;
      const info = {};
      return () =>
        cb(err, this.user, info);
    }
    return (req, res, next) =>
      next();
  };

  this.use = (/* strategy */) => {
    // debug('fake fb use:', arguments.length);
  };
})());

// eslint-disable-next-line no-param-reassign, global-require
const serverModule = require('../lib/server');

const logger = require('../lib/logging/logger').create('test.helper');

function getUrl(url) {
  if (_.startsWith(url, 'http')) {
    return url;
  }

  return `${'http'}://127.0.0.1:3001${url}`;
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

const data = {};

async function startServerAuthenticated() {
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

    const user = await mongo.findOrCreateUser(fbUser);

    assert(user);
    assert(user._id);
    assert(constants.mongoIdRE.test(user._id));
    assert(constants.mongoIdRE.test(user.locationIds[0]._id));

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

    assert.deepStrictEqual(user, expectedUser);

    return user;
  }

  function createPassport(user) {
    fakePassport.setUser(user);
  }

  function createServer(server) {
    return server || serverModule;
  }

  async function startServer(app, server) {
    if (app) {
      return app;
    }
    return server(); // returns a Promise
  }

  async function authenticateUser() {
    const { httpMsg } = await makeRequest({
      url: '/auth/facebook/callback',
    });
    assert(httpMsg.headers);
    assert(httpMsg.headers.location);
    const parts = httpMsg.headers.location.split('=');
    [, jwt] = parts; // 2nd element is jwt
    // logger.trace('Test jwt:', {jwt});
    assert(jwt);
    // eslint-disable-next-line no-param-reassign
    return fakePassport.getUserId();
  }

  try {
    await emptyDatabase();
    data.user = await createUser();
    createPassport(data.user);
    data.server = createServer(data.server);
    data.app = await startServer(data.app, data.server);
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
    assert.equal(httpMsg.statusCode, 200);

    assert(plant.title);

    return plant;
  }

  // generate some plants
  const promises = [...Array(numPlants).keys()].map(a => createPlant(a));
  return Promise.all(promises);
}

async function createNote(plantIds, noteOverride = {}) {
  assert(_.isArray(plantIds));
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
  logger.trace('createNote', { response });
  assert.equal(httpMsg.statusCode, 200);
  assert.equal(response.success, true);
  const { note } = response;
  assert(note._id);

  return response;
}

module.exports = {
  createNote,
  createPlants,
  getUrl,
  makeRequest,
  startServerAuthenticated,
};
