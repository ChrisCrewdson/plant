const _ = require('lodash');
const mongodb = require('mongodb');

const Create = require('./create');
const read = require('./read');
const constants = require('../../../app/libs/constants');
const Update = require('./update');
const remove = require('./delete');
const dbHelper = require('./helper');

const { ObjectID } = mongodb;

// CRUD operations for Location collection
class LocationData {
  // Location C: createLocation
  /**
   * Change types for saving
   * @param {DbLocation} loc
   */
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

  /**
   * Change types for biz layer
   * @param {object} options
   * @param {DbLocation|Array<DbLocation>} options.loc
   * @returns {DbLocation|Array<DbLocation>}
   */
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

  /**
   * Create Location
   * @static
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {object} options.loc
   * @param {Logger} options.logger
   * @returns
   * @memberof LocationData
   */
  static async createLocation({ db, loc, logger }) {
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

  /**
   * Create Location
   * @static
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {object} options.query
   * @param {object} options.options
   * @param {Logger} options.logger
   * @returns
   * @memberof LocationData
   */
  static async getLocationsByQuery({
    db, query, options, logger,
  }) {
    try {
      const { locationsOnly = false } = options;
      const locationOptions = {};
      const locationsData = await read(db, 'location', query, locationOptions);
      if (locationsOnly) {
        return locationsData;
      }

      /**
       * @type {DbLocation[]}
       */
      const locations = LocationData.convertLocationDataForRead({ loc: locationsData });
      const plantQuery = {};
      const plantOptions = {
        projection: { _id: 1, locationId: 1 },
      };
      /**
       * @type {DbPlant[]}
       */
      const plants = await read(db, 'plant', plantQuery, plantOptions);
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

  /**
   * Get all locations
   * @param {Object} options
   * @param {import('mongodb').Db} options.db
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async getAllLocations({ db, logger }) {
    return LocationData.getLocationsByQuery({
      db, query: {}, options: {}, logger,
    });
  }

  /**
   * Get a single location and augment it
   * @param {Object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.id - the location's id
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async getLocationById({ db, id, logger }) {
    const _id = new ObjectID(id);
    return LocationData.getLocationsByQuery({
      db, query: { _id }, options: {}, logger,
    });
  }

  /**
   * Get a single location and don't augment it
   * @param {Object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.id - the location's id
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async getLocationOnlyById({ db, id, logger }) {
    const _id = new ObjectID(id);
    const location = await LocationData.getLocationsByQuery({
      db,
      query: { _id },
      options: { locationsOnly: true },
      logger,
    });
    return location && location[0];
  }

  /**
   * Get a single location and don't augment it
   * @param {Object} options
   * @param {import('mongodb').Db} options.db
   * @param {string[]} options.ids - the locations ids
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async getLocationsByIds({ db, ids, logger }) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    return LocationData.getLocationsByQuery({
      db, query, options: {}, logger,
    });
  }

  /**
   * Gets all locations that the specified user manages or owns
   * Also gets all the users at each of those locations
   * @param {object} options
   * @param {object=} options.options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.userId - the userId of the user
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async getLocationsByUserId({
    db, userId, options = {}, logger,
  }) {
    // A location object looks like this:
    // { _id, createdBy, members: { id: role }, stations: {id: ...} title,
    //   loc: {type, coordinates: {}}}
    const query = { [`members.${userId}`]: { $exists: true } };
    return LocationData.getLocationsByQuery({
      db, query, options, logger,
    });
  }

  // Location U: updateLocation
  /**
   * Gets the user's role at the given location.
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.locationId - location id
   * @param {string} options.userId - user id
   * @param {Role[]} options.roles - roles that user needs to have
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async roleAtLocation({
    db, locationId, userId, roles, logger,
  }) {
    try {
      if (!constants.mongoIdRE.test(userId)) {
        throw new Error('roleAtLocation attempted with an invalid userId');
      }

      const location = await LocationData.getLocationOnlyById({ db, id: locationId, logger });

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

  /**
   * Update location by Id
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {object} options.location
   * @param {string} options.loggedInUserId
   * @param {Logger} options.logger
   * @returns {Promise}
   */
  static async updateLocationById({
    db, location, loggedInUserId, logger,
  }) {
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

  /**
   * Gets the user's role at the given location.
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options._id - location id
   * @param {string} options.loggedInUserId
   * @returns {Promise}
   */
  static async deleteLocation({ db, _id, loggedInUserId }) {
    // By creating a query that restricts by the location's _id and also where
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
