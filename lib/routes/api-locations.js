const _ = require('lodash');
const mongo = require('../db/mongo')();
const actions = require('../../app/actions');
const constants = require('../../app/libs/constants');
const tokenCheck = require('../auth/token-check');

const { requireToken } = tokenCheck;

const moduleName = 'routes/api-locations';

const {
  /** @type {UiActionType} */
  UPSERT_LOCATION_MEMBER,
  /** @type {UiActionType} */
  UPSERT_LOCATION_WEATHER,
  /** @type {UiActionType} */
  DELETE_LOCATION_MEMBER,
  /** @type {UiActionType} */
  DELETE_LOCATION_WEATHER,
} = actions.actionEnum;

/**
 * Return a 500 response to caller
 * @param {import("express").Response} res - Express response object
 */
const server500 = res => res.status(500).send({ success: false, message: 'server error' });

/**
 * api locations routes
 * @param {import("express").Application} app - Express application
 */
module.exports = (app) => {
  /**
   * getLocationById
   * @param {import("express").Request} req - Express request object
   * @param {import("express").Response} res - Express response object
   */
  const getLocationById = async (req, res) => {
    const { logger } = req;
    const { locationId = '' } = req.params || {};
    if (!locationId) {
      logger.error({
        moduleName,
        msg: 'No locationId in /api/location GET',
        'req.params': req.params,
      });
      return res.status(404).send({ success: false, message: 'Incorrect request, no location id' });
    }

    try {
      const location = await mongo.getLocationById(locationId, logger);
      return res.status(200).send(location);
    } catch (e) {
      return server500(res);
    }
  };
  app.get('/api/location/:locationId', getLocationById);

  app.get('/api/locations', async (req, res) => {
    const { logger } = req;
    try {
      const locations = await mongo.getAllLocations(logger);
      return res.status(200).send(locations);
    } catch (e) {
      return server500(res);
    }
  });

  /**
   * Check that role is valid
   * @param {Role} role - A role such as "owner" or "manager"
   */
  function roleIsValid(role) {
    return constants.roles.includes(role);
  }

  /**
   * Returns true if the loggedInMember is an owner.
   * Throws an error message if not an owner or not logged in.
   * @param {Dictionary<Role>} members - key is userId and value is role
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
   * @param {string} action
   * @param {UpsertLocationMember} data
   * @param {Logger} logger
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  async function upsertLocationMember(action, data, logger) {
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
    const location = await mongo.getLocationOnlyById(locationId, logger);
    if (!location) {
      throw new Error(`No location with _id ${locationId} found in DB`);
    }
    checkLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationMember');
    /** @type {BizLocation} */
    let modifiedLocation;
    if (UPSERT_LOCATION_MEMBER === action) {
      const members = Object.assign({}, location.members, { [userId]: role });
      modifiedLocation = Object.assign({}, location, { members });
    } else {
      modifiedLocation = /** @type {BizLocation} */ (_.omit(location, `members.${userId}`));
    }

    return mongo.updateLocationById(modifiedLocation, loggedInUserId, logger);
  }

  /**
   * Add a new weather station to a location
   * @param {string} action
   * @param {UpsertLocationWeather} data
   * @param {Logger} logger
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  async function upsertLocationWeather(action, data, logger) {
    const { body, user } = data;
    const { locationId, stationId, name } = body;
    const enabled = body.enabled === 'true';
    const { _id: loggedInUserId } = user;

    const location = await mongo.getLocationOnlyById(locationId, logger);
    if (!location) {
      throw new Error(`No location with _id ${locationId} found in DB during upsertLocationWeather`);
    }
    checkLocationOwner(location.members, loggedInUserId, locationId, 'upsertLocationWeather');
    /** @type {BizLocation} */
    let modifiedLocation;
    if (UPSERT_LOCATION_WEATHER === action) { // create or update
      const stations = Object.assign({}, location.stations, { [stationId]: { name, enabled } });
      modifiedLocation = Object.assign({}, location, { stations });
    } else { // delete
      modifiedLocation = /** @type {BizLocation} */ (_.omit(location, `stations.${stationId}`));
    }
    // TODO: If the station does not exist in the stations collection then
    // insert it into that collection.
    return mongo.updateLocationById(modifiedLocation, loggedInUserId, logger);
  }

  /** @type {Dictionary<UpsertLocationMemberFnBound>} */
  const modifyMemberActions = {
    [UPSERT_LOCATION_MEMBER]: upsertLocationMember.bind(null, UPSERT_LOCATION_MEMBER),
    [DELETE_LOCATION_MEMBER]: upsertLocationMember.bind(null, DELETE_LOCATION_MEMBER),
  };

  /** @type {Dictionary<UpsertLocationWeatherFnBound>} */
  const modifyWeatherActions = {
    [UPSERT_LOCATION_WEATHER]: upsertLocationWeather.bind(null, UPSERT_LOCATION_WEATHER),
    [DELETE_LOCATION_WEATHER]: upsertLocationWeather.bind(null, DELETE_LOCATION_WEATHER),
  };

  app.post('/api/location', requireToken, async (req, res) => {
    const {
      body: bodyOriginal,
      user: userOriginal,
      logger,
    } = req;
    try {
      const user = /** @type {UpsertLocationUser} */ (userOriginal);
      const body = /** @type {UpsertLocationBodyBase} */ (bodyOriginal || {});
      const { action } = body;
      logger.trace({ moduleName, msg: 'POST /api/location:', body });

      if (!modifyMemberActions[action] && !modifyWeatherActions[action]) {
        const err = new Error(`Action "${action}" not found in modifyActions in /api/location`);
        logger.error({ err, body });
        throw err;
      }

      /** @type {UpsertLocationMember|UpsertLocationWeather} */
      let data;
      switch (action) {
        case UPSERT_LOCATION_MEMBER:
        case DELETE_LOCATION_MEMBER:
          data = /** @type {UpsertLocationMember} */ ({ body, user });
          await modifyMemberActions[action](data, logger);
          break;
        case UPSERT_LOCATION_WEATHER:
        case DELETE_LOCATION_WEATHER:
          data = /** @type {UpsertLocationWeather} */ ({ body, user });
          await modifyWeatherActions[action](data, logger);
          break;
        default:
          throw new Error(`Unknown action ${action} in /api/location`);
      }

      return res.status(200).send({ success: true });
    } catch (modifyActionError) {
      logger.error({
        moduleName,
        msg: '/api/location',
        modifyActionError,
        bodyOriginal,
        userOriginal,
      });
      return res.status(400).send(modifyActionError);
    }
  });
};
