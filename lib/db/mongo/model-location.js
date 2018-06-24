const _ = require('lodash');
const Logger = require('lalog');
const mongodb = require('mongodb');

const Create = require('./create');
const read = require('./read');
const constants = require('../../../app/libs/constants');
const Update = require('./update');
const remove = require('./delete');
const dbHelper = require('./helper');
const { SERVICE_NAME } = require('../../../app/libs/constants');

const { ObjectID } = mongodb;
const moduleName = 'lib/db/mongo/model-location';

const logger = Logger.create({
  serviceName: SERVICE_NAME,
  moduleName,
  addTrackId: true,
});

// CRUD operations for Location collection
class LocationData {
  // Location C: createLocation
  static convertLocationDataTypesForSaving(loc) {
    if (loc._id) {
      // eslint-disable-next-line no-param-reassign
      loc._id = new ObjectID(loc._id);
    }
    if (loc.createdBy) {
      // eslint-disable-next-line no-param-reassign
      loc.createdBy = new ObjectID(loc.createdBy);
    }
  }

  static convertLocationDataForRead({ loc }) {
    if (!loc) {
      return loc;
    }
    if (_.isArray(loc)) {
      return loc.map(location => LocationData.convertLocationDataForRead({ loc: location }));
    }
    const convertedLocation = dbHelper.convertIdToString(loc);
    if (convertedLocation.createdBy) {
      convertedLocation.createdBy = convertedLocation.createdBy.toString();
    }
    return convertedLocation;
  }

  static async createLocation({ db, loc }) {
    try {
      if (!loc.members || !loc.createdBy) {
        throw new Error('members and createdBy must be specified as part of location when creating a location');
      }
      LocationData.convertLocationDataTypesForSaving(loc);
      const createdLocation = await Create.createOne(db, 'location', loc);
      logger.trace({ msg: 'createdLocation', createdLocation });
      return LocationData.convertLocationDataForRead({ loc: createdLocation });
    } catch (error) {
      logger.error({ msg: 'createLocation', err: error, loc });
      throw error;
    }
  }

  // Location R: getLocationById

  static async getLocationsByQuery({ db, query, options }) {
    try {
      const { locationsOnly = false } = options;
      const locationFields = {};
      const locationOptions = {};
      const locationsData = await read(db, 'location', query, locationFields, locationOptions);
      if (locationsOnly) {
        return locationsData;
      }

      const locations = LocationData.convertLocationDataForRead({ loc: locationsData });
      const plantQuery = {};
      const plantFields = { _id: true, locationId: true };
      const plantOptions = {};
      const plants = await read(db, 'plant', plantQuery, plantFields, plantOptions);
      const stringPlants = (plants || []).map(plant => ({
        _id: plant._id.toString(),
        locationId: plant.locationId.toString(),
      }));
      const locationsWithPlantIds = (locations || []).map((location) => {
        const id = location._id.toString();
        // eslint-disable-next-line no-param-reassign
        location.plantIds = stringPlants.filter(plant => plant.locationId === id).map(p => p._id);
        return location;
      });
      return locationsWithPlantIds;
    } catch (error) {
      logger.error({
        msg: 'getLocationsByQuery', err: error, query, options,
      });
      throw error;
    }
  }

  static async getAllLocations({ db }) {
    return LocationData.getLocationsByQuery({ db, query: {}, options: {} });
  }

  static async getLocationById({ db, id }) {
    const _id = new ObjectID(id);
    return LocationData.getLocationsByQuery({ db, query: { _id }, options: {} });
  }

  /**
   * Get a single location and don't augment it
   * @param {string} id - the location's id
   * @param {function} cb - callback for return value
   */
  static async getLocationOnlyById({ db, id }) {
    const _id = new ObjectID(id);
    const location = await LocationData.getLocationsByQuery({
      db,
      query: { _id },
      options: { locationsOnly: true },
    });
    return location && location[0];
  }

  static async getLocationsByIds({ db, ids }) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    return LocationData.getLocationsByQuery({ db, query, options: {} });
  }

  /**
   * Gets all locations that the specified user manages or owns
   * Also gets all the users at each of those locations
   * @param {string} userId - the userId of the user
   * @param {function} cb - method to call with the results
   * @returns {undefined}
   */
  static async getLocationsByUserId({ db, userId, options = {} }) {
    // A location object looks like this:
    // { _id, createdBy, members: { id: role }, stations: {id: ...} title,
    //   loc: {type, coordinates: {}}}
    const query = { [`members.${userId}`]: { $exists: true } };
    return LocationData.getLocationsByQuery({ db, query, options });
  }

  // Location U: updateLocation
  /**
   * Gets the user's role at the given location.
   * @param {string} locationId - location id
   * @param {string} userId - user id
   * @param {string[]} roles - roles that user needs to have
   * @param {function} cb - call with error and role
   */
  static async roleAtLocation({
    db, locationId, userId, roles,
  }) {
    try {
      if (!constants.mongoIdRE.test(userId)) {
        throw new Error('roleAtLocation attempted with an invalid userId');
      }

      const location = await LocationData.getLocationOnlyById({ db, id: locationId });

      const role = location && location.members && location.members[userId];
      return roles.includes(role);
    } catch (error) {
      logger.error({
        msg: 'roleAtLocation',
        err:
        error,
        locationId,
        userId,
        roles,
      });
      return false;
    }
  }

  static async updateLocationById({ db, location, loggedInUserId }) {
    try {
      LocationData.convertLocationDataTypesForSaving(location);
      // By creating a query that restricts by the location's _id and also where
      // the logged in user is the owner a non-owner can't update a location they
      // don't own.
      const updateQuery = {
        _id: new ObjectID(location._id),
        [`members.${loggedInUserId}`]: 'owner',
      };
      const set = _.omit(location, '_id');
      return Update.updateOne(db, 'location', updateQuery, set);
    } catch (error) {
      logger.error({
        msg: 'updateLocationById', err: error, location, loggedInUserId,
      });
      throw error;
    }
  }

  // Location D: deleteLocation

  static async deleteLocation({ db, _id, loggedInUserId }) {
    // By creating a query the restricts by the location's _id and also where
    // the logged in user is the owner a non-owner can't delete a location they
    // don't own.
    const deleteQuery = {
      _id: new ObjectID(_id),
      [`members.${loggedInUserId}`]: 'owner',
    };
    return remove(db, 'location', deleteQuery);
  }

  // End CRUD methods for Location collection
}

module.exports = LocationData;
