const _ = require('lodash');
const assert = require('assert');
const async = require('async');
const constants = require('../app/libs/constants');
const FakePassport = require('./fake-passport');
const mongo = require('../lib/db/mongo');
const proxyquire = require('proxyquire');
const request = require('request');
const { makeMongoId } = require('../app/libs/utils');

const logger = require('../lib/logging/logger').create('test.helper');

function getUrl(url) {
  if (_.startsWith(url, 'http')) {
    return url;
  }

  return `http://127.0.0.1:3001${url}`;
}

let jwt;
function makeRequest(opts, cb) {
  const auth = opts.authenticate
    ? { Authorization: `Bearer ${jwt}` }
    : {};

  const headers = Object.assign({},
    opts.headers || {},
    auth,
  );

  const followRedirect = opts.followRedirect || false;

  const options = Object.assign({},
    opts,
    { url: getUrl(opts.url) },
    { headers },
    { followRedirect },
  );

  // cb will get (error, httpMsg, response);
  request(options, cb);
}

const data = {};

function startServerAuthenticated(cb) {
  function emptyDatabase(done) {
    mongo.GetDb((dbGetError, db) => {
      assert(!dbGetError);
      async.each(['user', 'location', 'plant', 'note'], (collection, callback) => {
        const coll = db.collection(collection);
        coll.deleteMany({}, callback);
      }, (err) => {
        assert(!err);
        done(err, data);
      });
    });
  }

  function createUser(waterfallData, done) {
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

    mongo.findOrCreateUser(fbUser, (err, user) => {
      assert(!err);
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

      // eslint-disable-next-line no-param-reassign
      waterfallData.user = user;
      done(err, waterfallData);
    });
  }

  function createPassport(waterfallData, done) {
    if (waterfallData.passport) {
      waterfallData.passport.setUser(waterfallData.user);
    } else {
      // eslint-disable-next-line no-param-reassign
      waterfallData.passport = new FakePassport(waterfallData.user);
    }
    done(null, waterfallData);
  }

  function createServer(waterfallData, done) {
    if (!waterfallData.server) {
      // eslint-disable-next-line no-param-reassign
      waterfallData.server = proxyquire('../lib/server', { passport: waterfallData.passport });
    }
    done(null, waterfallData);
  }

  function startServer(waterfallData, done) {
    if (waterfallData.app) {
      return done(null, waterfallData);
    }
    return waterfallData.server((err, application) => {
      assert(!err);

      // eslint-disable-next-line no-param-reassign
      waterfallData.app = application;
      return done(null, waterfallData);
    });
  }

  function authenticateUser(waterfallData, done) {
    makeRequest({
      url: '/auth/facebook/callback',
    }, (error, httpMsg) => {
      assert(!error);
      assert(httpMsg.headers);
      assert(httpMsg.headers.location);
      const parts = httpMsg.headers.location.split('=');
      jwt = parts[1];
      // logger.trace('Test jwt:', {jwt});
      assert(jwt);
      // eslint-disable-next-line no-param-reassign
      waterfallData.userId = waterfallData.passport.getUserId();
      return done(null, waterfallData);
    });
  }

  async.waterfall([
    emptyDatabase,
    createUser,
    createPassport,
    createServer,
    startServer,
    authenticateUser,
  ], (err, waterfallData) => {
    assert(!err);
    // logger.trace('waterfallData:', {waterfallData});
    cb(err, waterfallData);
  });
}

function createPlants(numPlants, userId, locationId, cb) {
  const plantTemplate = {
    title: 'Plant Title',
    userId,
    locationId,
  };

  function createPlant(count, callback) {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: Object.assign({}, plantTemplate, { title: `${plantTemplate.title} ${count}` }),
      json: true,
      url: '/api/plant',
    };

    makeRequest(reqOptions, (error, httpMsg, plant) => {
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);

      assert(plant.title);

      callback(null, plant);
    });
  }

  // generate some plants
  async.times(numPlants, (n, next) => {
    createPlant(n, next);
  }, (err, plants) => {
    assert(!err);
    // we should now have 'numPlants' plants
    assert.equal(plants.length, numPlants);

    cb(err, plants);
  });
}

function createNote(plantIds, noteOverride = {}, cb) {
  assert(_.isArray(plantIds));
  const noteTemplate = Object.assign({
    note: 'This is a note',
    date: 20160101 },
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

  makeRequest(reqOptions, (error, httpMsg, response) => {
    logger.trace('createNote', { response });
    assert(!error);
    assert.equal(httpMsg.statusCode, 200);
    assert.equal(response.success, true);
    const { note } = response;
    assert(note._id);

    cb(null, response);
  });
}

module.exports = {
  createNote,
  createPlants,
  getUrl,
  makeRequest,
  startServerAuthenticated,
};
