const _ = require('lodash');
const mongodb = require('mongodb');
const { produce } = require('immer');

const Create = require('./create');
const {
  readLocation, readPlant,
} = require('./read');
const constants = require('../../../app/libs/constants');
const Update = require('./update');
const remove = require('./delete');

const { ObjectID } = mongodb;

// CRUD operations for Location collection
class LocationData {
  // Location C: createLocation

  /**
   * Change types for saving
   * @param {BizLocation} location
   * @returns {Readonly<DbLocation>}
   */
  static convertLocationDataTypesForSaving(location) {
    return produce(location,
      /**
       * @param {DbLocation} draft
       */
      (draft) => {
        if (draft._id) {
          draft._id = new ObjectID(draft._id);
        }
        if (draft.createdBy) {
          draft.createdBy = new ObjectID(draft.createdBy);
        }
        return draft;
      });
  }

  /**
   * Change types for biz layer
   * @param {DbLocation[]} locations
   * @returns {ReadonlyArray<Readonly<BizLocation>>}
   */
  static convertLocationDataForRead(locations) {
    if (!_.isArray(locations)) {
      throw new Error(`Expected loc to be an Array but it was ${typeof locations}`);
    }
    return locations.map((location) => LocationData.convertLocationDatumForRead(location));
  }

  /**
   * Change types for biz layer
   * @param {DbLocation} location
   * @returns {Readonly<BizLocation>}
   */
  static convertLocationDatumForRead(location) {
    if (!location) {
      return location;
    }

    return produce(location,
      /**
       * @param {BizLocation} draft
       */
      (draft) => {
        if (draft._id) {
          draft._id = draft._id.toString();
        }
        if (draft.createdBy) {
          draft.createdBy = draft.createdBy.toString();
        }
        return draft;
      });
  }

  /**
   * Create Location
   * @static
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {BizLocation} options.loc
   * @param {Logger} options.logger
   * @returns {Promise<Readonly<BizLocation>>}
   * @memberof LocationData
   */
  static async createLocation({ db, loc, logger }) {
    try {
      if (!loc.members || !loc.createdBy || !loc.title) {
        throw new Error('members, title and createdBy must be specified when creating a location');
      }
      const convertedLocation = LocationData.convertLocationDataTypesForSaving(loc);
      const createdLocation = await Create.createLocation(db, convertedLocation);
      logger.trace({ msg: 'createdLocation', createdLocation });
      return LocationData.convertLocationDatumForRead(createdLocation);
    } catch (error) {
      logger.error({ msg: 'createLocation', err: error, loc });
      throw error;
    }
  }

  // Location R: getLocationById

  /**
   * Get Locations
   * @static
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {object} options.query
   * @param {object} options.options
   * @param {Logger} options.logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof LocationData
   */
  static async getLocationsByQuery({
    db, query, options, logger,
  }) {
    try {
      const { locationsOnly = false } = options;
      const locationOptions = {};
      const locationsData = await readLocation(db, query, locationOptions);
      if (!locationsData) {
        return [];
      }

      const locations = LocationData.convertLocationDataForRead(locationsData);

      if (locationsOnly) {
        return locations;
      }

      const plantQuery = {};
      const plantOptions = {
        projection: { _id: 1, locationId: 1 },
      };

      const plants = await readPlant(db, plantQuery, plantOptions);
      const stringPlants = (plants || []).map((plant) => ({
        _id: plant._id.toString(),
        locationId: plant.locationId.toString(),
      }));
      const locationsWithPlantIds = (locations || []).map((location) => produce(location,
        /**
         * @param {BizLocation} draft
         */
        (draft) => {
          draft._id = (draft._id || '').toString();
          const id = draft._id;
          draft.createdBy = (draft.createdBy || '').toString();
          draft.plantIds = stringPlants.filter(
            (plant) => plant.locationId === id).map((p) => p._id);
        }));
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
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {Logger} options.logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   */
  static async getAllLocations({ db, logger }) {
    return LocationData.getLocationsByQuery({
      db, query: {}, options: {}, logger,
    });
  }

  /**
   * Get a single location and augment it
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.id - the location's id
   * @param {Logger} options.logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   */
  static async getLocationById({ db, id, logger }) {
    const _id = new ObjectID(id);
    return LocationData.getLocationsByQuery({
      db, query: { _id }, options: {}, logger,
    });
  }

  /**
   * Get a single location and don't augment it
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.id - the location's id
   * @param {Logger} options.logger
   * @returns {Promise<BizLocation|undefined>}
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
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string[]} options.ids - the locations ids
   * @param {Logger} options.logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   */
  static async getLocationsByIds({ db, ids, logger }) {
    const query = {
      _id: { $in: ids.map((id) => new ObjectID(id)) },
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
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
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
   * Checks if user has one of the roles listed in the roles property.
   * @param {object} options
   * @param {import('mongodb').Db} options.db
   * @param {string} options.locationId - location id
   * @param {string} options.userId - user id
   * @param {Role[]} options.roles - roles that user needs to have one of
   * @param {Logger} options.logger
   * @returns {Promise<boolean>}
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
      if (!role) {
        throw new Error(`role is falsy ${role} and location is ${JSON.stringify(location, null, 2)}`);
      }
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
   * @param {BizLocation} options.location
   * @param {string} options.loggedInUserId
   * @param {Logger} options.logger
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updateLocationById({
    db, location: loc, loggedInUserId, logger,
  }) {
    try {
      const location = LocationData.convertLocationDataTypesForSaving(loc);
      // By creating a query that restricts by the location's _id and also where
      // the logged in user is the owner a non-owner can't update a location they
      // don't own.
      const updateQuery = {
        _id: location._id,
        [`members.${loggedInUserId}`]: 'owner',
      };
      const set = _.omit(location, '_id');
      return Update.updateLocation(db, updateQuery, set);
    } catch (error) {
      logger.error({
        msg: 'updateLocationById', err: error, loc, loggedInUserId,
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
   * @returns {Promise<number|undefined>}
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
