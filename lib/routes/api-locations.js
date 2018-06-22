const _ = require('lodash');
const mongo = require('../db/mongo')();
const actions = require('../../app/actions');
const constants = require('../../app/libs/constants');
const tokenCheck = require('../config/token-check');

const { requireToken } = tokenCheck;

const moduleName = 'routes/api-locations';

const {
  UPSERT_LOCATION_MEMBER,
  UPSERT_LOCATION_WEATHER,
  DELETE_LOCATION_MEMBER,
  DELETE_LOCATION_WEATHER,
} = actions;

const server500 = res => res.status(500).send({ success: false, message: 'server error' });

module.exports = (app) => {
  app.get('/api/location/:locationId', async (req, res) => {
    const { logger } = req;
    const { locationId } = req.params || {};
    if (!locationId) {
      logger.error({ moduleName, msg: 'No locationId in /api/location GET', 'req.params': req.params });
      return res.status(404).send({ success: false, message: 'Incorrect request, no location id' });
    }

    try {
      const location = await mongo.getLocationById(locationId);
      return res.status(200).send(location);
    } catch (e) {
      return server500(res);
    }
  });

  app.get('/api/locations', async (req, res) => {
    try {
      const locations = await mongo.getAllLocations();
      return res.status(200).send(locations);
    } catch (e) {
      return server500(res);
    }
  });

  function roleIsValid(role) {
    return constants.roles.includes(role);
  }

  /**
   * Returns true if the loggedInMember is an owner.
   * Throws an error message if not an owner or not logged in.
   * @param {Object} members - key is userId and value is role
   * @param {string} loggedInUserId - userId of logged in user
   * @param {string} locationId
   * @param {string} methodName - caller's method name - used for logging
   * @returns {boolean} - true if member is owner
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
    if (UPSERT_LOCATION_WEATHER === action) { // create or update
      const stations = Object.assign({}, location.stations, { [stationId]: { name, enabled } });
      modifiedLocation = Object.assign({}, location, { stations });
    } else { // delete
      modifiedLocation = _.omit(location, `stations.${stationId}`);
    }
    // TODO: If the station does not exist in the stations collection then
    // insert it into that collection.
    return mongo.updateLocationById(modifiedLocation, loggedInUserId);
  }

  const modifyActions = {
    [UPSERT_LOCATION_MEMBER]: upsertLocationMember.bind(null, UPSERT_LOCATION_MEMBER),
    [UPSERT_LOCATION_WEATHER]: upsertLocationWeather.bind(null, UPSERT_LOCATION_WEATHER),
    [DELETE_LOCATION_MEMBER]: upsertLocationMember.bind(null, DELETE_LOCATION_MEMBER),
    [DELETE_LOCATION_WEATHER]: upsertLocationWeather.bind(null, DELETE_LOCATION_WEATHER),
  };

  app.post('/api/location', requireToken, async (req, res) => {
    const { body = {}, user, logger } = req;
    try {
      const { action } = body;
      logger.trace({ moduleName, msg: 'POST /api/location:', body });

      if (!modifyActions[action]) {
        throw new Error('Action not found in modifyActions in /api/location', { body });
      }

      await modifyActions[action]({ body, user });
      return res.status(200).send({ success: true });
    } catch (modifyActionError) {
      logger.error({
        moduleName,
        msg: '/api/location',
        modifyActionError,
        body,
        user,
      });
      return res.status(400).send(modifyActionError);
    }
  });
};
