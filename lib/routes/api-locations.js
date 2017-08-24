const mongo = require('../db/mongo');
const actions = require('../../app/actions');
const constants = require('../../app/libs/constants');
const tokenCheck = require('../config/token-check');
const _ = require('lodash');

const { requireToken } = tokenCheck;
const logger = require('../logging/logger').create('api-locations');

const {
  UPSERT_LOCATION_MEMBER,
  UPSERT_LOCATION_WEATHER,
  DELETE_LOCATION_MEMBER,
  DELETE_LOCATION_WEATHER,
} = actions;

module.exports = (app) => {
  app.get('/api/location/:locationId', (req, res) => {
    const { locationId } = req.params || {};
    if (!locationId) {
      logger.error('No locationId in /api/location GET', { 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no location id' });
    }

    return mongo.getLocationById(locationId, (getLocationError, location) => {
      if (getLocationError) {
        return res.status(500).send({ success: false, message: 'server error' });
      }
      return res.status(200).send(location);
    });
  });

  app.get('/api/locations', (req, res) => {
    mongo.getAllLocations((getLocationError, locations) => {
      if (getLocationError) {
        return res.status(500).send({ success: false, message: 'server error' });
      }
      return res.status(200).send(locations);
    });
  });

  function roleIsValid(role) {
    return constants.roles.includes(role);
  }

  /**
   * Returns true if the loggedInMember is an owner at this location otherwise false.
   * Also calls the callback with the error message if false.
   * @param {Object} members - key is userId and value is role
   * @param {string} loggedInUserId - userId of logged in user
   * @param {string} locationId
   * @param {string} methodName - caller's method name - used for logging
   * @param {function} cb 
   */
  function isLocationOwner(members, loggedInUserId, locationId, methodName, cb) {
    if (!members[loggedInUserId]) {
      cb(`logged in user ${loggedInUserId} is not a member of location ${locationId} in ${methodName}`);
      return false;
    }
    if (members[loggedInUserId] !== 'owner') {
      cb(`logged in user ${loggedInUserId} is not an owner of location ${locationId} in ${methodName}`);
      return false;
    }
    return true;
  }

  /**
   * Add a new member to a location
   * @param {Object} data
   * @param {string} data.locationId
   * @param {string} data.userId
   * @param {string} data.role
   */
  function upsertLocationMember(action, data, cb) {
    const { body, user } = data;
    const { locationId, userId, role } = body;
    const { _id: loggedInUserId } = user;

    if (UPSERT_LOCATION_MEMBER === action) {
      if (!roleIsValid(role)) {
        return cb(`${role} is not a valid role`);
      }
    }
    if (!constants.mongoIdRE.test(userId)) {
      return cb(`${userId} is not a valid mongoId`);
    }

    // Validation:
    // - locationId, userId are mongoIds (not really needed but will prevent
    //     a DB query if they are not)
    // - role is one of "owner", "manager", "member" - need a const for this
    // - logged in user is listed as a member of the location with role of owner
    return mongo.getLocationOnlyById(locationId, (getLocationError, location) => {
      if (getLocationError) {
        return cb(getLocationError);
      }
      if (!location) {
        return cb(`No location with _id ${locationId} found in DB`);
      }
      if (isLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationMember', cb)) {
        let modifiedLocation;
        if (UPSERT_LOCATION_MEMBER === action) {
          const members = Object.assign({}, location.members, { [userId]: role });
          modifiedLocation = Object.assign({}, location, { members });
        } else {
          modifiedLocation = _.omit(location, `members.${userId}`);
        }
        return mongo.updateLocationById(modifiedLocation, loggedInUserId, cb);
      }
      return undefined; // for lint
    });
  }

  /**
   * Add a new weather station to a location
   * @param {Object} data
   * @param {Object} data.body
   * @param {string} data.body.locationId
   * @param {string} data.body.stationId
   * @param {string} data.body.name
   * @param {string} data.body.enabled
   * @param {Object} data.user
   * @param {Object} data.user._id - id of logged in user
   */
  function upsertLocationWeather(action, data, cb) {
    const { body, user } = data;
    const { locationId, stationId, name } = body;
    const enabled = body.enabled === 'true';
    const { _id: loggedInUserId } = user;

    return mongo.getLocationOnlyById(locationId, (getLocationError, location) => {
      if (getLocationError) {
        return cb(getLocationError);
      }
      if (!location) {
        return cb(`No location with _id ${locationId} found in DB during upsertLocationWeather`);
      }
      if (isLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationWeather', cb)) {
        let modifiedLocation;
        if (UPSERT_LOCATION_WEATHER === action) {
          const stations = Object.assign({}, location.stations, { [stationId]: { name, enabled } });
          modifiedLocation = Object.assign({}, location, { stations });
        } else {
          modifiedLocation = _.omit(location, `stations.${stationId}`);
        }
        return mongo.updateLocationById(modifiedLocation, loggedInUserId, cb);
      }
      return undefined; // for lint
    });
  }

  const modifyActions = {
    [UPSERT_LOCATION_MEMBER]: upsertLocationMember.bind(null, UPSERT_LOCATION_MEMBER),
    [UPSERT_LOCATION_WEATHER]: upsertLocationWeather.bind(null, UPSERT_LOCATION_WEATHER),
    [DELETE_LOCATION_MEMBER]: upsertLocationMember.bind(null, DELETE_LOCATION_MEMBER),
    [DELETE_LOCATION_WEATHER]: upsertLocationWeather.bind(null, DELETE_LOCATION_WEATHER),
  };

  app.post('/api/location', requireToken, (req, res) => {
    const { body = {}, user } = req;
    const { action } = body;
    logger.trace('POST /api/location:', { body });

    if (!modifyActions[action]) {
      logger.error('Action not found in modifyActions in /api/location', { body });
    }

    modifyActions[action]({ body, user }, (modifyActionError) => {
      if (modifyActionError) {
        logger.error(modifyActionError, { body, user });
        return res.status(400).send(modifyActionError);
      }
      return res.status(200).send({ success: true });
    });
  });
};
