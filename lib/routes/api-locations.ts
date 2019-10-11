import { Application, Response, Request } from 'express';
import { getDbInstance } from '../db/mongo';
import { UiActionType } from '../../app/actions';

const _ = require('lodash');

const mongo = getDbInstance();
const actions = require('../../app/actions');
const constants = require('../../app/libs/constants');
const tokenCheck = require('../auth/token-check');

const { requireToken } = tokenCheck;

const moduleName = 'routes/api-locations';

const {
  UPSERT_LOCATION_MEMBER,
  UPSERT_LOCATION_WEATHER,
  DELETE_LOCATION_MEMBER,
  DELETE_LOCATION_WEATHER,
} = actions.actionEnum as Record<string, UiActionType>;

/**
 * Return a 500 response to caller
 */
const server500 = (res: Response): Response => res.status(500).send({ success: false, message: 'server error' });

/**
 * api locations routes
 */
export const locationsApi = (app: Application) => {
  /**
   * getLocationById
   */
  const getLocationById = async (req: Request, res: Response): Promise<Response> => {
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
   * @returns {boolean}
   */
  function roleIsValid(role: Role): boolean {
    return constants.roles.includes(role);
  }

  /**
   * Returns true if the loggedInMember is an owner.
   * Throws an error message if not an owner or not logged in.
   * @param {Record<string, Role>} members - key is userId and value is role
   * @param {string} loggedInUserId - userId of logged in user
   * @param {string} locationId
   * @param {string} methodName - caller's method name - used for logging
   * @returns {boolean} - true if member is owner or throws
   */
  function checkLocationOwner(members: Record<string, Role>,
    loggedInUserId: string, locationId: string, methodName: string): boolean {
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
  async function upsertLocationMember(action: string, data: UpsertLocationMember, logger: Logger): Promise<import('mongodb').UpdateWriteOpResult> {
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
    let modifiedLocation: BizLocation;
    if (UPSERT_LOCATION_MEMBER === action) {
      const members = { ...location.members, [userId]: role };
      modifiedLocation = { ...location, members };
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
  async function upsertLocationWeather(action: string, data: UpsertLocationWeather, logger: Logger): Promise<import('mongodb').UpdateWriteOpResult> {
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
    let modifiedLocation: BizLocation;
    if (UPSERT_LOCATION_WEATHER === action) { // create or update
      const stations = { ...location.stations, [stationId]: { name, enabled } };
      modifiedLocation = { ...location, stations };
    } else { // delete
      modifiedLocation = /** @type {BizLocation} */ (_.omit(location, `stations.${stationId}`));
    }
    // TODO: If the station does not exist in the stations collection then
    // insert it into that collection.
    return mongo.updateLocationById(modifiedLocation, loggedInUserId, logger);
  }

  /** @type {Record<string, UpsertLocationMemberFnBound>} */
  const modifyMemberActions: Record<string, UpsertLocationMemberFnBound> = {
    [UPSERT_LOCATION_MEMBER]: upsertLocationMember.bind(null, UPSERT_LOCATION_MEMBER),
    [DELETE_LOCATION_MEMBER]: upsertLocationMember.bind(null, DELETE_LOCATION_MEMBER),
  };

  /** @type {Record<string, UpsertLocationWeatherFnBound>} */
  const modifyWeatherActions: Record<string, UpsertLocationWeatherFnBound> = {
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
      const user = (userOriginal) as UpsertLocationUser;
      const body = (bodyOriginal || {}) as UpsertLocationBodyBase;
      const { action } = body;
      logger.trace({ moduleName, msg: 'POST /api/location:', body });

      if (!modifyMemberActions[action] && !modifyWeatherActions[action]) {
        const err = new Error(`Action "${action}" not found in modifyActions in /api/location`);
        logger.error({ err, body });
        throw err;
      }


      let data: UpsertLocationMember | UpsertLocationWeather;
      switch (action) {
        case UPSERT_LOCATION_MEMBER:
        case DELETE_LOCATION_MEMBER:
          data = ({ body, user }) as UpsertLocationMember;
          await modifyMemberActions[action](data, logger);
          break;
        case UPSERT_LOCATION_WEATHER:
        case DELETE_LOCATION_WEATHER:
          data = ({ body, user }) as UpsertLocationWeather;
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
