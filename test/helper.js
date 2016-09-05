import _ from 'lodash';
import assert from 'assert';
import async from 'async';
import constants from '../app/libs/constants';
import FakePassport from './fake-passport';
import mongo from '../lib/db/mongo';
import proxyquire from 'proxyquire';
import request from 'request';
import {makeMongoId} from '../app/libs/utils';

// const logger = require('../lib/logging/logger').create('test.helper');

export function getUrl(url) {
  if(_.startsWith(url, 'http')) {
    return url;
  }

  return `http://127.0.0.1:3001${url}`;
}

let jwt;
export function makeRequest(opts, cb) {

  const auth = opts.authenticate
    ? {Authorization: 'Bearer ' + jwt }
    : {};

  const headers = {
    ...(opts.headers || {}),
    ...auth
  };

  const followRedirect = opts.followRedirect || false;

  const options = {
    ...opts,
    url: getUrl(opts.url),
    headers,
    followRedirect
  };

  // cb will get (error, httpMsg, response);
  request(options, cb);
}

const data = {};

export function startServerAuthenticated(cb) {
  function emptyDatabase(done) {
    mongo.GetDb((dbGetError, db) => {
      assert(!dbGetError);
      async.each(['user', 'plant', 'note'], (collection, callback) => {
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
        verified: true
      },
      name: 'John Smith',
      email: 'test@test.com',
      createdAt: '2016-01-28T14:59:32.989Z',
      updatedAt: '2016-01-28T14:59:32.989Z'
    };

    mongo.findOrCreateUser(fbUser, (err, user) => {
      // logger.trace('findOrCreateUser callback', {err, user, fbUser});

      assert(!err);
      assert(user);
      assert(user._id);
      assert(constants.mongoIdRE.test(user._id));
      assert.deepEqual(_.omit(user, ['_id']), fbUser);

      waterfallData.user = user;
      done(err, waterfallData);
    });
  }

  function createPassport(waterfallData, done) {
    if(waterfallData.passport) {
      waterfallData.passport.setUser(waterfallData.user);
    } else {
      waterfallData.passport = new FakePassport(waterfallData.user);
    }
    done(null, waterfallData);
  }

  function createServer(waterfallData, done) {
    if(!waterfallData.server) {
      waterfallData.server = proxyquire('../lib/server', { passport: waterfallData.passport });
    }
    done(null, waterfallData);
  }

  function startServer(waterfallData, done) {
    if(waterfallData.app) {
      return done(null, waterfallData);
    }
    waterfallData.server.default((err, application) => {
      assert(!err);

      waterfallData.app = application;
      return done(null, waterfallData);
    });
  }

  function authenticateUser(waterfallData, done) {
    makeRequest({
      url: '/auth/facebook/callback'
    }, (error, httpMsg) => {
      assert(!error);
      assert(httpMsg.headers);
      assert(httpMsg.headers.location);
      const parts = httpMsg.headers.location.split('=');
      jwt = parts[1];
      // logger.trace('Test jwt:', {jwt});
      assert(jwt);
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
    authenticateUser
  ], (err, waterfallData) => {
    assert(!err);
    // logger.trace('waterfallData:', {waterfallData});
    cb(err, waterfallData);
  });
};

export function createPlants(numPlants, userId, cb) {
  const plantTemplate = {
    title: 'Plant Title',
    userId
  };

  var createPlant = function(count, callback) {
    const reqOptions = {
      method: 'POST',
      authenticate: true,
      body: {...plantTemplate, title: `${plantTemplate.title} ${count}`},
      json: true,
      url: '/api/plant'
    };

    makeRequest(reqOptions, (error, httpMsg, plant) => {
      assert(!error);
      assert.equal(httpMsg.statusCode, 200);

      assert(plant.title);

      callback(null, plant);
    });
  };

  // generate some plants
  async.times(numPlants, (n, next) => {
    createPlant(n, next);
  }, function(err, plants) {
    assert(!err);
    // we should now have 'numPlants' plants
    assert.equal(plants.length, numPlants);

    cb(err, plants);
  });

}

export function createNote(plantIds, noteOverride = {}, cb) {
  assert(_.isArray(plantIds));
  const noteTemplate = {
    note: 'This is a note',
    date: new Date(),
    plantIds,
    ...noteOverride
  };

  const reqOptions = {
    method: 'POST',
    authenticate: true,
    body: noteTemplate,
    json: true,
    url: '/api/note'
  };

  makeRequest(reqOptions, (error, httpMsg, response) => {
    assert(!error);
    assert.equal(httpMsg.statusCode, 200);
    assert(response._id);

    cb(null, response);
  });


}
