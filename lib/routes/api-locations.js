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

const server500 = res => () => res.status(500).send({ success: false, message: 'server error' });

module.exports = (app) => {
  app.get('/api/location/:locationId', (req, res) => {
    const { locationId } = req.params || {};
    if (!locationId) {
      logger.error('No locationId in /api/location GET', { 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no location id' });
    }

    return mongo.getLocationById(locationId)
      .then(location => res.status(200).send(location))
      .catch(server500(res));
  });

  app.get('/api/locations', (req, res) => mongo.getAllLocations()
    .then(locations => res.status(200).send(locations))
    .catch(server500(res)));

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
  function checkLocationOwner(members, loggedInUserId, locationId, methodName) {
    if (!members[loggedInUserId]) {
      throw new Error(`logged in user ${loggedInUserId} is not a member of location ${locationId} in ${methodName}`);
    }
    if (members[loggedInUserId] !== 'owner') {
      throw new Error(`logged in user ${loggedInUserId} is not an owner of location ${locationId} in ${methodName}`);
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
  async function upsertLocationMember(action, data) {
    const { body, user } = data;
    const { locationId, userId, role } = body;
    const { _id: loggedInUserId } = user;

    if (UPSERT_LOCATION_MEMBER === action) {
      if (!roleIsValid(role)) {
        throw new Error(`${role} is not a valid role`);
      }
    }
    if (!constants.mongoIdRE.test(userId)) {
      throw new Error(`${userId} is not a valid mongoId`);
    }

    // Validation:
    // - locationId, userId are mongoIds (not really needed but will prevent
    //     a DB query if they are not)
    // - role is one of "owner", "manager", "member" - need a const for this
    // - logged in user is listed as a member of the location with role of owner
    const location = await mongo.getLocationOnlyById(locationId);
    if (!location) {
      throw new Error(`No location with _id ${locationId} found in DB`);
    }
    checkLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationMember');
    let modifiedLocation;
    if (UPSERT_LOCATION_MEMBER === action) {
      const members = Object.assign({}, location.members, { [userId]: role });
      modifiedLocation = Object.assign({}, location, { members });
    } else {
      modifiedLocation = _.omit(location, `members.${userId}`);
    }
    return mongo.updateLocationById(modifiedLocation, loggedInUserId);
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
  async function upsertLocationWeather(action, data) {
    const { body, user } = data;
    const { locationId, stationId, name } = body;
    const enabled = body.enabled === 'true';
    const { _id: loggedInUserId } = user;

    const location = await mongo.getLocationOnlyById(locationId);
    if (!location) {
      throw new Error(`No location with _id ${locationId} found in DB during upsertLocationWeather`);
    }
    checkLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationWeather');
    let modifiedLocation;
    if (UPSERT_LOCATION_WEATHER === action) {
      const stations = Object.assign({}, location.stations, { [stationId]: { name, enabled } });
      modifiedLocation = Object.assign({}, location, { stations });
    } else {
      modifiedLocation = _.omit(location, `stations.${stationId}`);
    }
    return mongo.updateLocationById(modifiedLocation, loggedInUserId);
  }

  const modifyActions = {
    [UPSERT_LOCATION_MEMBER]: upsertLocationMember.bind(null, UPSERT_LOCATION_MEMBER),
    [UPSERT_LOCATION_WEATHER]: upsertLocationWeather.bind(null, UPSERT_LOCATION_WEATHER),
    [DELETE_LOCATION_MEMBER]: upsertLocationMember.bind(null, DELETE_LOCATION_MEMBER),
    [DELETE_LOCATION_WEATHER]: upsertLocationWeather.bind(null, DELETE_LOCATION_WEATHER),
  };

  app.post('/api/location', requireToken, (req, res) => {
    const { body = {}, user } = req;
    try {
      const { action } = body;
      logger.trace('POST /api/location:', { body });

      if (!modifyActions[action]) {
        throw new Error('Action not found in modifyActions in /api/location', { body });
      }

      return modifyActions[action]({ body, user })
        .then(() => res.status(200).send({ success: true }));
    } catch (modifyActionError) {
      logger.error('/api/location', { modifyActionError, body, user });
      return res.status(400).send(modifyActionError);
    }
  });
};
