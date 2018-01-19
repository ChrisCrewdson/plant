const _ = require('lodash');
const mongodb = require('mongodb');
const Create = require('./create');
const read = require('./read');
const constants = require('../../../app/libs/constants');
const Update = require('./update');
const remove = require('./delete');
const dbHelper = require('./helper');

const { ObjectID } = mongodb;

const logger = require('../../logging/logger').create('mongo-model-location');

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

  static convertLocationDataForRead(loc) {
    if (!loc) {
      return loc;
    }
    if (_.isArray(loc)) {
      return loc.map(LocationData.convertLocationDataForRead);
    }
    const convertedLocation = dbHelper.convertIdToString(loc);
    if (convertedLocation.createdBy) {
      convertedLocation.createdBy = convertedLocation.createdBy.toString();
    }
    return convertedLocation;
  }

  static async createLocation(db, loc) {
    try {
      if (!loc.members || !loc.createdBy) {
        throw new Error('members and createdBy must be specified as part of location when creating a location');
      }
      LocationData.convertLocationDataTypesForSaving(loc);
      const createdLocation = await Create.createOne(db, 'location', loc);
      logger.trace('createdLocation', { createdLocation });
      return LocationData.convertLocationDataForRead(createdLocation);
    } catch (error) {
      logger.error('createLocation', { error, loc });
      throw error;
    }
  }

  // Location R: getLocationById

  static async getLocationsByQuery(db, query, options) {
    try {
      const { locationsOnly = false } = options;
      const locationFields = {};
      const locationOptions = {};
      const locationsData = await read(db, 'location', query, locationFields, locationOptions);
      if (locationsOnly) {
        return locationsData;
      }

      const locations = LocationData.convertLocationDataForRead(locationsData);
      const plantQuery = {};
      const plantFields = { _id: true, locationId: true };
      const plantOptions = {};
      const plants = await read(db, 'plant', plantQuery, plantFields, plantOptions);
      const stringPlants = (plants || []).map(plant => ({
        _id: plant._id.toString(),
        locationId: plant.locationId.toString(),
      }));
      const locationsWithPlantIds = (locations || []).map((location) => {
        // eslint-disable-next-line no-param-reassign
        location.plantIds = stringPlants.filter(plant =>
          plant.locationId === location._id.toString()).map(p => p._id);
        return location;
      });
      return locationsWithPlantIds;
    } catch (error) {
      logger.error('getLocationsByQuery', { error, query, options });
      throw error;
    }
  }

  static async getAllLocations(db) {
    return LocationData.getLocationsByQuery(db, {}, {});
  }

  static async getLocationById(db, id) {
    const _id = new ObjectID(id);
    return LocationData.getLocationsByQuery(db, { _id }, {});
  }

  /**
   * Get a single location and don't augment it
   * @param {string} id - the location's id
   * @param {function} cb - callback for return value
   */
  static async getLocationOnlyById(db, id) {
    const _id = new ObjectID(id);
    const location = await LocationData.getLocationsByQuery(db, { _id }, { locationsOnly: true });
    return location && location[0];
  }

  static async getLocationsByIds(db, ids) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    return LocationData.getLocationsByQuery(db, query, {});
  }

  /**
   * Gets all locations that the specified user manages or owns
   * Also gets all the users at each of those locations
   * @param {string} userId - the userId of the user
   * @param {function} cb - method to call with the results
   * @returns {undefined}
   */
  static async getLocationsByUserId(db, userId, options = {}) {
    // A location object looks like this:
    // { _id, createdBy, members: { id: role }, stations: {id: ...} title,
    //   loc: {type, coordinates: {}}}
    const query = { [`members.${userId}`]: { $exists: true } };
    return LocationData.getLocationsByQuery(db, query, options);
  }

  // Location U: updateLocation
  /**
   * Gets the user's role at the given location.
   * @param {string} locationId - location id
   * @param {string} userId - user id
   * @param {string[]} roles - roles that user needs to have
   * @param {function} cb - call with error and role
   */
  static async roleAtLocation(db, locationId, userId, roles) {
    try {
      if (!constants.mongoIdRE.test(userId)) {
        throw new Error('roleAtLocation attempted with an invalid userId');
      }

      const location = await LocationData.getLocationOnlyById(db, locationId);

      const role = location && location.members && location.members[userId];
      return roles.includes(role);
    } catch (error) {
      logger.error('roleAtLocation', {
        error, locationId, userId, roles,
      });
      return false;
    }
  }

  static async updateLocationById(db, location, loggedInUserId) {
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
      logger.error('updateLocationById', { error, location, loggedInUserId });
      throw error;
    }
  }

  // Location D: deleteLocation

  static async deleteLocation(db, _id, loggedInUserId) {
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
