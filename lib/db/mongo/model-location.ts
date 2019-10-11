import mongodb, { Db } from 'mongodb';

import _ from 'lodash';
import { produce } from 'immer';

import {
  readLocation, readPlant,
} from './read';

import { Create } from './create';
import { Update } from './update';
import { remove } from './delete';
import * as constants from '../../../app/libs/constants';

const { ObjectID } = mongodb;
interface CreateLocationOptions {
  db: Db;
  loc: BizLocation;
  logger: Logger;
}
interface GetLocationByQueryOptions {
  db: Db;
  logger: Logger;
  options: {
    locationsOnly?: boolean;
  };
  query: object;
}
// CRUD operations for Location collection
export class LocationData {
  // Location C: createLocation

  /**
   * Change types for saving
   */
  static convertLocationDataTypesForSaving(location: BizLocation): Readonly<DbLocation> {
    return produce(location,
      (draft: DbLocation) => {
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
   */
  static convertLocationDataForRead(locations: DbLocation[]): ReadonlyArray<Readonly<BizLocation>> {
    if (!_.isArray(locations)) {
      throw new Error(`Expected loc to be an Array but it was ${typeof locations}`);
    }
    return locations.map((location) => LocationData.convertLocationDatumForRead(location));
  }

  /**
   * Change types for biz layer
   */
  static convertLocationDatumForRead(location: DbLocation): Readonly<BizLocation> {
    return produce(location, (draft: BizLocation) => {
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
   * @memberof LocationData
   */
  static async createLocation({ db, loc, logger }: CreateLocationOptions):
   Promise<Readonly<BizLocation>> {
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
   * @memberof LocationData
   */
  static async getLocationsByQuery({
    db, query, options, logger,
  }: GetLocationByQueryOptions): Promise<ReadonlyArray<Readonly<BizLocation>>> {
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
        (draft: BizLocation) => {
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
  static async getAllLocations({ db, logger }: {db: Db; logger: Logger},
  ): Promise<ReadonlyArray<Readonly<BizLocation>>> {
    return LocationData.getLocationsByQuery({
      db, query: {}, options: {}, logger,
    });
  }

  /**
   * Get a single location and augment it
   */
  static async getLocationById({ db, id, logger }: {db: Db; id: string; logger: Logger},
  ): Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const _id = new ObjectID(id);
    return LocationData.getLocationsByQuery({
      db, query: { _id }, options: {}, logger,
    });
  }

  /**
   * Get a single location and don't augment it
   */
  static async getLocationOnlyById({ db, id, logger }: {db: Db; id: string; logger: Logger},
  ): Promise<BizLocation | undefined> {
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
   */
  static async getLocationsByIds({ db, ids, logger }: {db: Db; ids: string[]; logger: Logger},
  ): Promise<ReadonlyArray<Readonly<BizLocation>>> {
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
   */
  static async getLocationsByUserId({
    db, userId, options = {}, logger,
  }: {db: Db; userId: string; logger: Logger; options: any},
  ): Promise<ReadonlyArray<Readonly<BizLocation>>> {
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
   */
  static async roleAtLocation({
    db, locationId, userId, roles, logger,
  }: {db: Db; locationId: string; userId: string; roles: Role[]; logger: Logger},
  ): Promise<boolean> {
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
   */
  static async updateLocationById({
    db, location: loc, loggedInUserId, logger,
  }: {db: Db; location: BizLocation; loggedInUserId: string; logger: Logger},
  ): Promise<import('mongodb').UpdateWriteOpResult> {
    try {
      const location = LocationData.convertLocationDataTypesForSaving(loc);
      // By creating a query that restricts by the location's _id and also where
      // the logged in user is the owner a non-owner can't update a location they
      // don't own.
      const updateQuery = {
        _id: location._id,
        [`members.${loggedInUserId}`]: 'owner',
      };
      const set = _.omit(location, '_id') as DbLocation;
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
   */
  static async deleteLocation({ db, _id, loggedInUserId }:
    { db: Db; _id: string; loggedInUserId: string},
  ): Promise<number | undefined> {
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
