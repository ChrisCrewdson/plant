import { MongoClient, ObjectID, Db } from 'mongodb';

const _ = require('lodash');
const { produce } = require('immer');

const constants = require('../../../app/libs/constants');
const {
  readUser, readUserTiny, readLocation, readNote, readPlant, readByCollection,
} = require('./read');
const Create = require('./create');
const Update = require('./update');
const remove = require('./delete');
const utils = require('../../../app/libs/utils');
const modelLocation = require('./model-location');
const dbHelper = require('./helper');

const moduleName = 'lib/db/mongo/index';

const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${process.env.PLANT_DB_NAME || 'plant'}`;

// This stores a cache of the user's location
/** @type {LocationLocCache} */
const locationLocCache: LocationLocCache = {};

/**
 * Given a collection of users and locations return a collection of users
 * with the locationIds populated for each user.
 * The Mongo ObjectIds should have already been stringified in each collection
 * @param {ReadonlyArray<Readonly<BizUser>>} users - an array of user object
 * @param {ReadonlyArray<Readonly<BizLocation>>} locations - an array of location objects
 * @returns {ReadonlyArray<Readonly<BizUser>>} an array of users,
 * each now with a locationIds array of strings
 */
function getUsersWithLocations(users: ReadonlyArray<Readonly<BizUser>>,
  locations: ReadonlyArray<Readonly<BizLocation>>): ReadonlyArray<Readonly<BizUser>> {
  return (users || []).map((user) => {
    const locationIds = locations.reduce((acc, location) => {
      if (location.members[user._id]) {
        acc.push((location._id || '').toString());
      }
      return acc;
    }, [] as string[]);

    return {
      ...user,
      locationIds,
    };
  });
}

interface NoteSplit {
  singlePlantNotes: ObjectID[];
  multiplePlantNotes: DbNote[];
}

/**
 * All the CRUD operations for all collections are done through this class.
 * At some point in the future there might be justification in splitting each
 * collection into its own class. Because there are so few collections and it's
 * fairly simple they're all in here for now.
 *
 * This is the layer that all string to Mongo ObjectID conversion takes place.
 * Reads and Updates:
 *  query convert from string to ObjectID
 *  result Ids converted from ObjectID to string
 * Insert:
 *  Ids in documents converted to ObjectID
 *  result Ids converted from ObjectID to string
 * Delete:
 *  query convert from string to ObjectID
 *
 * Mongo ObjectID fields stored in collections that require conversion in this layer:
 * User:
 *  _id
 * Plant:
 *  _id, userId
 * Note:
 *  _id, userId, plantIds[]
 */
class MongoDb {
  connection: string;

  // @ts-ignore - Property has no initializer. Not definitely assigned in the constructor.ts(2564)
  client: MongoClient;

  // @ts-ignore - Property has no initializer. Not definitely assigned in the constructor.ts(2564)
  db: Db;
  // static async convertPlantDataForRead: (plant: DbPlant | Array<DbPlant>,
  //   loggedInUserId: string | undefined | null, logger: Logger) =>
  //   Promise<BizPlant | Array<BizPlant>>;

  /**
   * MongoDB Constructor
   */
  constructor(connection?: string) {
    this.connection = connection || mongoConnection;
  }

  /**
   * Returns the string used to make the DB connection
   * @returns {string}
   */
  getDbConnection(): string {
    return this.connection;
  }

  /**
   * Returns the MongoDb client instance
   */
  getDbClient(): MongoClient | undefined {
    return this.client;
  }

  /**
   * Get the DB connection to use for a CRUD operation.
   * If it doesn't exist then create it.
   * @param {Logger} logger
   * @return {Promise<Db>}
   */
  async GetDb(logger: Logger): Promise<Db> {
    try {
      if (!this.db) {
        const { connection } = this;
        logger.trace({
          moduleName,
          msg: 'About to connect to MongoDB',
          connection,
        });
        logger.time('connect-to-mongo');
        this.client = await MongoClient.connect(connection, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        if (!this.client) {
          throw new Error(`client is not truthy ${this.client}`);
        }
        const parts = connection.split('/');
        this.db = this.client.db(parts.pop());
        logger.timeEnd('connect-to-mongo', {
          moduleName,
          msg: 'Connection to MongoDB complete',
          connection,
        });
      }
      return this.db;
    } catch (err) {
      logger.error({
        moduleName,
        msg: 'Connection to mongo failed:',
        err,
        connection: this.connection,
        mongoConnection,
      });
      throw err;
    }
  }

  /**
   * Close connection to DB
   * @param {Logger} logger
   * @returns {Promise<void>}
   */
  async _close(logger: Logger): Promise<void> {
    logger.trace({ moduleName, msg: 'Closing DB Connection.' });
    try {
      if (this.client) {
        await this.client.close(true);
      }
    } catch (closeErr) {
      logger.error({ moduleName, msg: 'Error calling db.close()', closeErr });
    }
  }


  // CRUD operations for User collection

  // User CR: Create and Read are in a single function for user

  /**
   * Gets the user from the user collection based on the user's facebook/google id.
   * If the user does not exist then creates the user first.
   * @param {UserDetails} userDetails - the object that Facebook/Google OAuth returns
   * @param {Logger} logger - logger
   * @return {Promise<Readonly<BizUser>>}
   */
  async findOrCreateUser(userDetails: UserDetails, logger: Logger): Promise<Readonly<BizUser>> {
    try {
      if (!_.get(userDetails, 'facebook.id') && !_.get(userDetails, 'google.id')) {
        throw new Error(`No facebook.id or google.id:\n${JSON.stringify(userDetails, null, 2)}`);
      }
      // 1. Get the DB
      const db = await this.GetDb(logger);

      const { facebook, google } = userDetails;

      // 2. Set the query to find the user
      /** @type {QueryBySocialMedia|undefined} */
      let queryBySocialMedia: QueryBySocialMedia | undefined;
      if (facebook) {
        queryBySocialMedia = {
          'facebook.id': facebook.id,
        };
      }
      if (google) {
        queryBySocialMedia = {
          'google.id': google.id,
        };
      }
      if (!queryBySocialMedia) {
        throw new Error('One of facebook or google must be defined on userDetails');
      }

      const userFromSocialMedia = async () => {
        // 3. Find the user by OAuth provider id
        const user = await readUser(db, queryBySocialMedia, {});

        if (user && user.length !== 1) {
          logger.error({ moduleName, msg: `Unexpected user.length: ${user.length}`, user });
        }

        /**
         * @type {BizUser}
         */
        const bizUser: BizUser = user && user.length > 0 && dbHelper.convertIdToString(user[0]);
        return bizUser;
      };

      // 4. If user not found then try find by email
      const userFromEmail = async () => {
        if (!userDetails.email) {
          return null;
        }

        const queryByEmail = {
          email: userDetails.email,
        };
        const dbUser = await readUser(db, queryByEmail, {});
        return dbUser && dbUser.length > 0 && dbHelper.convertIdToString(dbUser[0]);
      };

      const user = await userFromSocialMedia() || await userFromEmail();

      // 5. Update the user's details
      //    If they had previously signed in with Facebook and now with
      //    Google then this will add their Google credentials to their
      //    account.
      //    If they've changed anything about themselves on the OAuth
      //    provider (e.g. updated an email address) then this will update
      //    that.
      if (user) {
        _.merge(user, userDetails);
        const userData = _.omit(user, ['_id']);
        const query = { _id: new ObjectID(user._id) };
        try {
          await Update.updateUser(db, query, userData);
        } catch (err) {
          logger.error({
            moduleName, msg: 'Error in user update', query, err,
          });
          throw err;
        }
      }

      // 6. If user add locations ELSE Create user
      if (user) {
        // TODO: Need a new method that just returns the locations for the user. The
        // method below returns an "over populated" object from which a single prop is
        // extracted.
        const locations = await this.getLocationsByUserId(user._id, {}, logger);
        user.locationIds = locations.map((location) => location._id || '');
        return user;
      }

      const dbUser = await Create.createUser(db, userDetails);
      const newUser = MongoDb.dbUserToBizUser(dbUser);

      const location: BizLocation = {
        createdBy: newUser._id,
        members: { [newUser._id]: 'owner' },
        stations: {},
        title: `${newUser.name || ''} Yard`,
      };
      await this.createLocation(location, logger);
      const locations = await this.getLocationsByUserId(newUser._id, {}, logger);

      const userWithLocations = produce(newUser, (draft: BizUser) => {
        draft.locationIds = locations.map((loc) => loc._id || '');
      });

      return userWithLocations;
    } catch (error) {
      logger.error({ moduleName, msg: 'findOrCreateUser Error', error });
      throw error;
    }
  }

  /**
   * @memberof MongoDb
   */
  static dbUserToBizUser(dbUser: Readonly<Partial<DbUser>>): Readonly<BizUser> {
    return produce(dbUser,
      /**
        * @param {BizUser} draft
        */
      (draft: BizUser) => {
        if (draft._id) {
          draft._id = draft._id.toString();
        }
        return draft;
      });
  }

  /**
   * @memberof MongoDb
   */
  static dbUsersToBizUsers(dbUsers: Readonly<DbUser>[]): ReadonlyArray<Readonly<BizUser>> {
    return produce(dbUsers,
      /**
        * @param {BizUser[]} draft
        */
      (draft: BizUser[]) => {
        draft.forEach((bizUser) => {
          bizUser._id = bizUser._id.toString();
        });
        return draft;
      });
  }

  /**
   * User R: Read user
   */
  async getUserByQuery(query: object, logger: Logger): Promise<DbUserTiny[]> {
    try {
      const db = await this.GetDb(logger);

      const users = await readUserTiny(db, query);

      return users || [];
    } catch (readUserError) {
      logger.error({
        moduleName, msg: 'getUserByQuery readUserError:', err: readUserError, query,
      });
      throw readUserError;
    }
  }

  /**
   * Get user by id
   */
  async getUserById(userId: string, logger: Logger): Promise<BizUser | undefined> {
    try {
      if (!constants.mongoIdRE.test(userId)) {
        return undefined; // for lint
      }
      const userQuery = {
        _id: new ObjectID(userId),
      };

      const users = await this.getUserByQuery(userQuery, logger);
      if (users) {
        if (users.length !== 1) {
          throw new Error(`Unexpected users.length: ${users.length}`);
        }

        // Use this in the Mongo REPL:
        // db.location.find({ 'members.57b4e90d9f0e4e114b44bcf8' : {$exists: true} })
        // In the location collection the members object has the user's id as a key/prop
        // and the value is a string with the role.
        // This query checks if that user's id is in the members object.

        const locations = await this.getLocationsByUserId(userId, {
          locationsOnly: true,
        }, logger);

        // Convert Mongo ObjectIds to strings
        const user = MongoDb.dbUserToBizUser(
          _.pick(users[0], ['_id', 'name', 'createdAt']),
        );
        return {
          ...user,
          locationIds: (locations || []).map(({ _id }) => (_id || '').toString()),
        };
      }

      logger.warn({ moduleName, msg: 'No user found in query', userQuery });
      return undefined; // for lint
    } catch (err) {
      logger.error({ moduleName, msg: 'getUserById', userId });
      throw err;
    }
  }

  // User U: Update user

  // User D: No Delete function for User yet
  // End CRUD methods for collection "user"

  // CRUD operations for Plant collection

  // Plant C: cratePlant

  // eslint-disable-next-line class-methods-use-this
  convertPlantDataTypesForSaving(plantIn: BizPlant | UiPlantsValue): Readonly<DbPlant> {
    const plant: DbPlant = plantIn as unknown as DbPlant;
    if (plant._id) {
      plant._id = new ObjectID(plant._id);
    }
    plant.userId = new ObjectID(plant.userId);
    plant.locationId = new ObjectID(plant.locationId);

    if (plant.plantedDate) {
      plant.plantedDate = utils.dateToInt(plant.plantedDate);
    }
    if (plant.purchasedDate) {
      plant.purchasedDate = utils.dateToInt(plant.purchasedDate);
    }
    if (plant.terminatedDate) {
      plant.terminatedDate = utils.dateToInt(plant.terminatedDate);
    }

    return plant;
  }

  /**
   * Rebases a plant based on the location's loc value
   * @param {BizPlant} plant - plant object with a loc property that needs rebasing
   * @param {Geo} loc - the location's loc object
   * @returns {BizPlant} - the rebased plant object.
   */
  // eslint-disable-next-line class-methods-use-this
  rebasePlant(plant: BizPlant, loc: Geo): BizPlant {
    if (!plant.loc) {
      return plant;
    }
    // eslint-disable-next-line no-param-reassign
    plant.loc.coordinates[0] = loc.coordinates[0] - plant.loc.coordinates[0];
    // eslint-disable-next-line no-param-reassign
    plant.loc.coordinates[1] = loc.coordinates[1] - plant.loc.coordinates[1];
    return plant;
  }

  /**
   * Rebase the plant's location by the location's "loc" location
   * If the location document does not have a loc property then assign
   * the loc property from the plant as the location's loc value.
   * @param plant - the plant which needs the loc rebased
   * @param logger
   */
  async rebasePlantByLoc(plant: BizPlant, logger: Logger): Promise<Readonly<BizPlant>> {
    if (!plant.loc) {
      return plant;
    }
    if (locationLocCache[plant.locationId]) {
      return this.rebasePlant(plant, locationLocCache[plant.locationId]);
    }
    const db = await this.GetDb(logger);
    const locationQuery = {
      _id: new ObjectID(plant.locationId),
    };
    const options = {};
    try {
      const locations = await readLocation(db, locationQuery, options);
      if (!locations) {
        throw new Error(`locations is unexpectedly falsy ${typeof locations}`);
      }
      // Might have been cached by a parallel async call so check again
      if (locationLocCache[plant.locationId]) {
        return this.rebasePlant(plant, locationLocCache[plant.locationId]);
      }
      const locat = locations[0];
      if (locat.loc) {
        locationLocCache[plant.locationId] = locat.loc;
        return this.rebasePlant(plant, locationLocCache[plant.locationId]);
      }
      locationLocCache[plant.locationId] = plant.loc;
      locat.loc = plant.loc;

      await Update.updateLocation(db, locationQuery, locat);
      return this.rebasePlant(plant, locationLocCache[plant.locationId]);
    } catch (readLocationError) {
      logger.error({
        moduleName, msg: 'rebasePlantByLoc readLocationError:', readLocationError, locationQuery,
      });
      // eslint-disable-next-line no-param-reassign
      delete plant.loc;
      throw readLocationError;
    }
  }

  async convertPlantDataForRead(plant: DbPlant | Array<DbPlant>,
    loggedInUserId: string | undefined | null, logger: Logger):
    Promise<BizPlant | Array<BizPlant>> {
    if (_.isArray(plant)) {
      const _this = this; // eslint-disable-line @typescript-eslint/no-this-alias
      const promises = (plant as DbPlant[]).map(
        (p) => _this.convertPlantDataForReadOne(p, loggedInUserId, logger, null));
      return Promise.all(promises);
    }

    return this.convertPlantDataForReadOne(plant as DbPlant, loggedInUserId, logger, null);
  }

  async convertPlantDataForReadOne(plant: Readonly<DbPlant>,
    loggedInUserId: string | undefined | null, logger: Logger,
    notes?: DbNote[] | null): Promise<Readonly<BizPlant>> {
    const convertedPlant = plant as unknown as BizPlant;

    if (convertedPlant._id) {
      convertedPlant._id = convertedPlant._id.toString();
    }

    convertedPlant.notes = (notes || []).map((note) => note._id.toString());

    if (convertedPlant.userId) {
      convertedPlant.userId = convertedPlant.userId.toString();
    }

    if (convertedPlant.locationId) {
      convertedPlant.locationId = convertedPlant.locationId.toString();
    }

    // Only return the geoLocation of the plant if it's the
    // logged in user requesting their own plant
    // TODO: Should be if the user has one of the roles of:
    //       'owner', 'manager', 'member'
    //       Do this by adding another param to the convertPlantDataForRead
    //       method to include location or locationMembers.
    if (convertedPlant.loc && convertedPlant.userId !== loggedInUserId) {
      return this.rebasePlantByLoc(convertedPlant, logger);
    }
    return convertedPlant;
  }

  /**
   * Create Plant
   * @param {UiPlantsValue} plantIn
   * @param {string} loggedInUserId
   * @param {Logger} logger
   * @returns {Promise<BizPlant>}
   * @memberof MongoDb
   */
  async createPlant(plantIn: UiPlantsValue, loggedInUserId: string, logger: Logger):
  Promise<BizPlant> {
    try {
      const db = await this.GetDb(logger);
      if (!plantIn.userId) {
        logger.warn({ moduleName, msg: 'Missing plant.userId', plantIn });
        throw new Error('userId must be specified as part of plant when creating a plant');
      }
      const isAuthorized = await this.roleAtLocation(plantIn.locationId, loggedInUserId, ['owner', 'manager'], logger);
      if (isAuthorized) {
        const plant = this.convertPlantDataTypesForSaving(plantIn);
        /** @type {DbPlant} */
        const createdPlant: DbPlant = await Create.createPlant(db, plant);
        const convertedPlant = await this
          .convertPlantDataForReadOne(createdPlant, loggedInUserId, logger, null);
        return convertedPlant;
      }
      throw new Error('Logged in user not authorized to create plant at this location');
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'createPlant',
        error,
        plantIn,
        loggedInUserId,
      });
      throw error;
    }
  }

  /**
   * Gets the plant document from the plant collection and sets the
   * notes property of this document to an array of notes queried
   * from the notes collection.
   * @param {string} plantId - mongoId of plant to fetch
   * @param {string|undefined} loggedInUserId - the id of the user currently logged in or falsy if
   *   anonymous request
   * @param {Logger} logger
   * @returns {Promise<Readonly<BizPlant>|undefined>}
   * @memberof MongoDb
   */
  async getPlantById(plantId: string, loggedInUserId: string | undefined, logger: Logger):
  Promise<Readonly<BizPlant> | undefined> {
    if (!constants.mongoIdRE.test(plantId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb(logger);
      const query = {
        _id: new ObjectID(plantId),
      };
      const options = {};

      const plants = await readPlant(db, query, options);
      if (plants && plants.length === 1) {
        const noteQuery = { plantIds: plants[0]._id };
        const noteOptions = {
          projection: { _id: 1 },
          sort: [['date', 'asc']],
        };

        const notes = await readNote(db, noteQuery, noteOptions);

        // Convert Mongo ObjectIds to strings
        const plant = await this.convertPlantDataForReadOne(
          plants[0], loggedInUserId, logger, notes,
        );

        return plant;
      }

      // readError and plant are both falsy
      logger.warn({ moduleName, msg: 'No plant found in query', query });
      return undefined;
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'getPlantById',
        error,
        plantId,
        loggedInUserId,
      });
      throw error;
    }
  }

  /**
   * Gets all the plants belonging to a Location. Does not populate the notes field.
   * @param {string} locationId - the locationId to query against the plant collection.
   * @param {string|undefined} loggedInUserId - the id of the user currently logged in or
   *   falsy if anonymous request
   * @param {Logger} logger
   * @return {Promise<BizPlant|BizPlant[]|undefined>}
   */
  async getPlantsByLocationId(locationId: string, loggedInUserId: string | undefined,
    logger: Logger): Promise<BizPlant | BizPlant[] | undefined> {
    if (!constants.mongoIdRE.test(locationId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb(logger);
      const _id = new ObjectID(locationId);
      const options = {};

      const locations = await readLocation(db, { _id }, options);
      if (locations && locations.length > 0) {
        const plantQuery = { locationId: _id };
        const plantOptions = { sort: [['title', 'asc']] };

        const plants = await readPlant(db, plantQuery, plantOptions);
        return this.convertPlantDataForRead(plants || [], loggedInUserId, logger);
      }
      return undefined;
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'getPlantsByLocationId',
        error,
        locationId,
        loggedInUserId,
      });
      throw error;
    }
  }

  /**
   * Get Plants By IDs
   * @param {String[]} ids
   * @param {String|undefined|null} loggedInUserId
   * @param {Logger} logger
   * @returns {Promise<BizPlant|BizPlant[]>}
   * @memberof MongoDb
   */
  async getPlantsByIds(ids: string[], loggedInUserId: string | undefined | null, logger: Logger):
   Promise<BizPlant | BizPlant[]> {
    try {
      const plantQuery = {
        _id: { $in: ids.map((id) => new ObjectID(id)) },
      };
      const plantOptions = { sort: [['title', 'asc']] };
      const db = await this.GetDb(logger);

      const plants = await readPlant(db, plantQuery, plantOptions);
      return this.convertPlantDataForRead(plants || [], loggedInUserId, logger);
    } catch (error) {
      logger.error({ moduleName, msg: 'getPlantsByIds', error });
      throw error;
    }
  }

  // Plant U: updatePlant

  /**
   * Update Plant
   * @param {BizPlant|UiPlantsValue} plantIn
   * @param {string} loggedInUserId
   * @param {Logger} logger
   * @returns {Promise<BizPlant>}
   * @memberof MongoDb
   */
  async updatePlant(plantIn: BizPlant | UiPlantsValue, loggedInUserId: string, logger: Logger):
   Promise<BizPlant> {
    try {
      if (!plantIn._id || !plantIn.userId) {
        throw new Error(`Must supply _id (${plantIn._id}) and userId (${plantIn.userId}) when updating a plant`);
      }
      const plant = this.convertPlantDataTypesForSaving(plantIn);
      const db = await this.GetDb(logger);
      const query = _.pick(plant, ['_id', 'userId']);
      const set = _.omit(plant, ['_id']);
      await Update.updatePlant(db, query, set);
      return this.convertPlantDataForReadOne(plant, loggedInUserId, logger, null);
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'updatePlant',
        error,
        plantIn,
        loggedInUserId,
      });
      throw error;
    }
  }

  // Plant D: deletePlant
  // Plant D: deleteAllPlantsByUserId

  /**
   * Removes the plant from the plant collection and also removes any notes that
   * reference this plant only. Any notes that reference multiple plants will be
   * updated and the reference to that plant removed.
   * @param {string} id - Id of plant to delete
   * @param {string} userIdParam - Id of user that plant belongs to
   * @param {Logger} logger
   * @returns {Promise<number|undefined>}
   */
  async deletePlant(id: string, userIdParam: string, logger: Logger): Promise<number | undefined> {
    // Steps to delete a plant
    // 1. Retrieve note documents associated with Plant
    // 2. Delete note documents that only reference this plant
    // 3. Update note documents that reference multiple plants by remove the
    //    reference to this plant.
    // 4. Delete plant document.
    try {
      const db = await this.GetDb(logger);
      const _id = new ObjectID(id);
      const userId = new ObjectID(userIdParam);

      const noteQuery = { plantIds: _id, userId };
      const noteOptions = { sort: [['date', 'asc']] };

      const init: NoteSplit = {
        singlePlantNotes: [],
        multiplePlantNotes: [],
      };

      const notesForPlant = await readNote(db, noteQuery, noteOptions) as DbNote[] | null;
      // Split the notesForPlant array in 2:
      // 1. Those that only reference this plant - need to delete these
      // 2. Those that reference multiple plants - need to update these and
      //    remove this plant's reference
      const splitNotes = (notesForPlant || []).reduce((acc, note) => {
        if (note.plantIds.length === 1) {
          acc.singlePlantNotes.push(note._id);
        } else {
          acc.multiplePlantNotes.push(note);
        }
        return acc;
      }, init);


      const { singlePlantNotes, multiplePlantNotes } = splitNotes;
      // Delete Notes that don't have other associated plants
      // TODO: Confirm that this does a bulk delete
      // Need tests where noteIds end up being array of:
      // 0, 1, 2 in length
      if (singlePlantNotes.length > 0) {
        const deleteQuery = { _id: { $in: splitNotes.singlePlantNotes } };
        await remove(db, 'note', deleteQuery);
        // TODO: Add a check that the number of documents removed in removeNoteResults
        // is same as length of array passed to _id.
        // Don't need the singlePlantNotes anymore so don't need to pass them on.
        // return splitNotes.singlePlantNotes;
      }

      // Remove deleted plant from notes with associated plants
      if (multiplePlantNotes.length > 0) {
        const updatedNotes = multiplePlantNotes.map((note) => ({

          ...note,
          plantIds: note.plantIds.filter((plantId) => plantId.toString() !== id),
        }));
        const promises = updatedNotes.map((updateNote) => {
          const noteUpdateQuery = { _id: updateNote._id };
          const set = _.omit(updateNote, ['_id']);
          return Update.updateNote(db, noteUpdateQuery, set);
        });
        await Promise.all(promises);
      }

      return remove(db, 'plant', { _id, userId });
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'deletePlant',
        error,
        id,
        userIdParam,
      });
      throw error;
    }
  }

  // Only used for testing - so far - needs to delete notes as well if to be used in prod
  /**
   * TEST ONLY METHOD: Delete All Plants By UserId
   * @param {string} userIdParam
   * @param {Logger} logger
   * @returns {Promise<number|undefined>}
   * @memberof MongoDb
   */
  async deleteAllPlantsByUserId(userIdParam: string, logger: Logger): Promise<number | undefined> {
    const db = await this.GetDb(logger);
    const userId = new ObjectID(userIdParam);
    return remove(db, 'plant', { userId });
  }

  // End CRUD methods for Plant collection

  // CRUD operations for Note collection

  // Note C: createNote

  /**
   * Convert Note Data Types for Saving
   * @param {BizNote|BizNoteNew} noteParam
   * @returns {DbNote}
   * @memberof MongoDb
   */
  // eslint-disable-next-line class-methods-use-this
  convertNoteDataTypesForSaving(noteParam: BizNote | BizNoteNew): DbNote {
    const note: DbNote = noteParam as unknown as DbNote;
    if (note._id) {
      // eslint-disable-next-line no-param-reassign
      note._id = new ObjectID(note._id);
    }
    if (note.date) {
      // eslint-disable-next-line no-param-reassign
      note.date = utils.dateToInt(note.date);
    }
    if (note.plantIds && note.plantIds.length > 0) {
      // eslint-disable-next-line no-param-reassign
      note.plantIds = note.plantIds.map((plantId) => new ObjectID(plantId));
    }
    // eslint-disable-next-line no-param-reassign
    note.userId = new ObjectID(note.userId);
    return note;
  }

  // eslint-disable-next-line class-methods-use-this
  convertNoteDataForRead(note: DbNote, logger: Logger): Readonly<BizNote> {
    const convertedNote = note as unknown as BizNote;
    if (convertedNote._id) {
      convertedNote._id = convertedNote._id.toString();
    }
    if (convertedNote.userId) {
      convertedNote.userId = convertedNote.userId.toString();
    } else {
      logger.error({
        moduleName, msg: 'In convertNoteDataForRead() there is no userId', note, convertedNote,
      });
    }
    if (convertedNote.plantIds && convertedNote.plantIds.length) {
      convertedNote.plantIds = (convertedNote.plantIds || []).map((plantId) => plantId.toString());
    }
    return convertedNote;
  }

  convertNotesDataForRead(note: DbNote[], logger: Logger): BizNote[] {
    if (!note || !note.length) {
      return [];
    }
    return note.map((n) => this.convertNoteDataForRead(n, logger));
  }

  async createNote(note: BizNoteNew, logger: Logger): Promise<BizNote> {
    try {
      const db = await this.GetDb(logger);
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when creating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      // eslint-disable-next-line no-param-reassign
      note.plantIds = note.plantIds || [];

      const createdNote = await Create.createNote(db, note);
      logger.trace({ moduleName, msg: 'createdNote', createdNote });
      return this.convertNoteDataForRead(createdNote, logger);
    } catch (error) {
      logger.error({
        moduleName, msg: 'createNote', error, note,
      });
      throw error;
    }
  }

  // Note R: getNoteById

  /**
   * Get Notes by Query
   * @param {object} query
   * @param {Logger} logger
   * @returns {Promise<BizNote[]|undefined>}
   * @memberof MongoDb
   */
  async getNotesByQuery(query: object, logger: Logger): Promise<BizNote[] | undefined> {
    try {
      const db = await this.GetDb(logger);
      const noteOptions = { sort: [['date', 'asc']] };

      const notes = await readNote(db, query, noteOptions);

      if (notes && notes.length > 0) {
        return this.convertNotesDataForRead(notes, logger);
      }
      // This is okay - will happen during an upsert
      logger.trace({ moduleName, msg: 'getNotesByQuery nothing found', query });
      return undefined;
    } catch (error) {
      logger.error({
        moduleName, msg: 'getNotesByQuery', error, query,
      });
      throw error;
    }
  }

  /**
   * Get Note by Query
   * @param {object} query
   * @param {Logger} logger
   * @returns {Promise<BizNote|undefined>}
   * @memberof MongoDb
   */
  async getNoteByQuery(query: object, logger: Logger): Promise<BizNote | undefined> {
    try {
      const notes = await this.getNotesByQuery(query, logger);
      if (!notes || !notes.length) {
        return undefined;
      }
      if (notes.length > 1) {
        throw new Error(`Only expecting 1 note back in getNoteByQuery but got ${notes.length}`);
      }
      return notes[0];
    } catch (error) {
      logger.error({ moduleName, msg: 'getNoteByQuery', query });
      throw error;
    }
  }

  /**
   * Get Notes by Query
   * @param {string=} id
   * @param {Logger} logger
   * @returns {Promise<BizNote|undefined>}
   * @memberof MongoDb
   */
  async getNoteById(id: string | undefined, logger: Logger): Promise<BizNote | undefined> {
    if (!id) {
      return undefined;
    }
    const _id = new ObjectID(id);
    return this.getNoteByQuery({ _id }, logger);
  }

  /**
   * Get Note by Image ID
   * @param {string} imageId
   * @param {Logger} logger
   * @returns {Promise<BizNote|undefined>}
   * @memberof MongoDb
   */
  async getNoteByImageId(imageId: string, logger: Logger): Promise<BizNote | undefined> {
    const query = {
      images: { $elemMatch: { id: imageId } },
    };
    return this.getNoteByQuery(query, logger);
  }

  /**
   * Get Notes by IDs
   * @param {string[]} ids
   * @param {Logger} logger
   * @returns {Promise<BizNote[]|undefined>}
   * @memberof MongoDb
   */
  async getNotesByIds(ids: string[], logger: Logger): Promise<BizNote[] | undefined> {
    const query = {
      _id: { $in: ids.map((id) => new ObjectID(id)) },
    };
    return this.getNotesByQuery(query, logger);
  }

  /**
   * Get Notes Latest (Used for RSS)
   * @param {number} qty
   * @param {Logger} logger
   * @returns {Promise<DbNoteWithPlants[]>}
   * @memberof MongoDb
   */
  async getNotesLatest(qty: number, logger: Logger): Promise<DbNoteWithPlants[]> {
    // This method doesn't work with getNoteByQuery since we need .limit()
    // Calling Mongo directly from here, for now
    try {
      const db = await this.GetDb(logger);
      const notes = await db.collection('note').find().sort({ date: -1 }).limit(qty)
        .toArray();

      return this.getNotesWithPlants(notes, logger); // next step: match up with plant names
    } catch (error) {
      logger.error({
        moduleName, msg: 'getNotesLatest', error, qty,
      });
      throw error;
    }

    // This seemed like a good idea but then I realized that plantIds is an array
    /* db.collection('note').aggregate([
       {"$sort": { "date": -1 }},
       {"$limit": qty},
       {"$lookup": {
       "localField": "plantIds",
       "from": "plant",
       "foreignField": "_id",
       "as": "plant_details"
        }
       },
       { "$unwind": "$plant" },
     ],
     (noteErr, result) => {
       if(noteErr) return cb(noteErr);

       cb(null, result);
      }); */
  }

  async getNotesWithPlants(notesCopy: DbNote[], logger: Logger): Promise<DbNoteWithPlants[]> {
    try {
      /**
       * @type {string[]}
      */
      const init: string[] = [];

      // Grab the plant ids off each note (can be more than 1 per note)
      const myPlantIds = notesCopy.reduce((acc,
        { plantIds }) => acc.concat(plantIds.map((plantId) => plantId.toString())), init,
      );

      const plants = await this.getPlantsByIds(_.uniq(myPlantIds), null, logger) as BizPlant[];

      const notes = notesCopy.map((note) => {
        const plantIds = note.plantIds.map((pId) => pId.toString());
        return {
          ...note,
          plants: plants.filter((plant) => plantIds.includes(plant._id.toString())),
        };
      });

      return notes;
    } catch (error) {
      logger.error({
        moduleName, msg: 'getNotesWithPlants', error, notesCopy,
      });
      throw error;
    }
  }

  getNotesByPlantId(plantId: string, logger: Logger): Promise<BizNote[] | undefined> {
    const query = { plantIds: new ObjectID(plantId) };
    return this.getNotesByQuery(query, logger);
  }

  getNotesByPlantIds(plantIds: string[], logger: Logger): Promise<BizNote[] | undefined> {
    const query = {
      plantIds: {
        $in: plantIds.map((plantId) => new ObjectID(plantId)),
      },
    };
    return this.getNotesByQuery(query, logger);
  }

  // Note U: updateNote

  async updateNote(note: BizNote, logger: Logger): Promise<BizNote> {
    try {
      const db = await this.GetDb(logger);
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      const convertedNote = this.convertNoteDataTypesForSaving(note);
      const query = _.pick(note, ['_id', 'userId']);
      const set = _.omit(convertedNote, ['_id']);
      await Update.updateNote(db, query, set);
      // results => {n:1, nModified:1, ok:1}

      return this.convertNoteDataForRead(note as unknown as DbNote, logger);
    } catch (error) {
      logger.error({
        moduleName, msg: 'updateNote', error, note,
      });
      throw error;
    }
  }

  /**
   * Add sizes to Note Image
   * @param {NoteImageUpdateData} noteUpdate
   * @param {Logger} logger
   * @returns {Promise<void>}
   * @memberof MongoDb
   */
  async addSizesToNoteImage(noteUpdate: NoteImageUpdateData, logger: Logger): Promise<void> {
    try {
      const db = await this.GetDb(logger);
      if (!noteUpdate.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      // @ts-ignore - TODO: DataType Converters to Type at end
      this.convertNoteDataTypesForSaving(noteUpdate);
      const { _id, userId } = noteUpdate;
      const query = {
        _id,
        images: { $elemMatch: { id: noteUpdate.imageId } },
        userId,
      };
      const set = { $set: { 'images.$.sizes': noteUpdate.sizes } };
      logger.trace({
        moduleName, msg: 'mongo.addSizesToNoteImage', query, set,
      });
      await Update.updateOne(db, 'note', query, set);
    } catch (error) {
      logger.error({
        moduleName, msg: 'mongo.addSizesToNoteImage', error, noteUpdate,
      });
      throw error;
    }
  }

  // Note UI: upsertNote

  /**
   * Upsert Note
   * @param {BizNote|BizNoteNew} note
   * @param {Logger} logger
   * @returns {Promise<BizNote>}
   * @memberof MongoDb
   */
  async upsertNote(note: BizNote | BizNoteNew, logger: Logger): Promise<BizNote> {
    try {
      const { _id } = note;
      const foundNote = await this.getNoteById(_id && _id.toString(), logger);
      return foundNote
        ? await this.updateNote(note as BizNote, logger)
        : await this.createNote(note, logger);
    } catch (error) {
      logger.error({
        moduleName, msg: 'upsertNote', error, note,
      });
      throw error;
    }
  }

  // Note D: deleteNote

  /**
   * Delete Note
   * @param {string} _id
   * @param {string|undefined} userId
   * @param {Logger} logger
   * @returns {Promise<number|undefined>}
   * @memberof MongoDb
   */
  async deleteNote(_id: string, userId: string | undefined, logger: Logger):
   Promise<number | undefined> {
    try {
      const db = await this.GetDb(logger);
      return remove(db, 'note', {
        _id: new ObjectID(_id),
        userId: new ObjectID(userId),
      });
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'deleteNote',
        error,
        _id,
        userId,
      });
      throw error;
    }
  }

  // End CRUD methods for Note collection

  // CRUD operations for Location collection

  // Location C: createLocation

  /**
   * Create Location
   * @param {*} loc
   * @param {Logger} logger
   * @returns {Promise<Readonly<BizLocation>>}
   * @memberof MongoDb
   */
  async createLocation(loc: any, logger: Logger): Promise<Readonly<BizLocation>> {
    const db = await this.GetDb(logger);
    return modelLocation.createLocation({ db, loc, logger });
  }

  // Location R: getLocationById

  /**
   * Get All Users
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizUser>>>}
   * @memberof MongoDb
   */
  async getAllUsers(logger: Logger): Promise<ReadonlyArray<Readonly<BizUser>>> {
    try {
      const db = await this.GetDb(logger);
      const userQuery = {};
      const userOptions = {
        projection: { _id: 1, name: 1, createdAt: 1 },
      };

      const dbUsers = await readUser(db, userQuery, userOptions);
      if (!dbUsers) {
        return [];
      }
      const users = MongoDb.dbUsersToBizUsers(dbUsers);

      const locationQuery = {};
      const locationOptions = {
        projection: { _id: true, members: true },
      };

      const locations = await readLocation(db, locationQuery, locationOptions);
      if (!locations) {
        throw new Error(`locations is unexpectedly falsy ${typeof locations}`);
      }
      const convertedLocations = modelLocation.convertLocationDataForRead(locations);
      const usersWithlocationIds = getUsersWithLocations(users, convertedLocations);
      return usersWithlocationIds;
    } catch (error) {
      logger.error({ moduleName, msg: 'getAllUsers', error });
      throw error;
    }
  }

  /**
   * Get Locations by Query
   * @param {object} query
   * @param {object} options
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof MongoDb
   */
  async getLocationsByQuery(query: object, options: object, logger: Logger):
   Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByQuery({
      db, query, options, logger,
    });
  }

  /**
   * Get All Locations
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof MongoDb
   */
  async getAllLocations(logger: Logger): Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const db = await this.GetDb(logger);
    return modelLocation.getAllLocations({ db, logger });
  }

  /**
   * Get Location By ID - also gets other data besides just the location
   * @param {string} id
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof MongoDb
   */
  async getLocationById(id: string, logger: Logger): Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationById({ db, id, logger });
  }

  /**
   * Get Location By ID
   * @param {string} id
   * @param {Logger} logger
   * @returns {Promise<BizLocation|undefined>}
   * @memberof MongoDb
   */
  async getLocationOnlyById(id: string, logger: Logger): Promise<BizLocation | undefined> {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationOnlyById({ db, id, logger });
  }

  /**
   * Get locations by ids
   * @param {string[]} ids
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof MongoDb
   */
  async getLocationsByIds(ids: string[], logger: Logger):
  Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByIds({ db, ids, logger });
  }

  /**
   * Get locations by user ID
   * @param {string} userId
   * @param {object} options
   * @param {Logger} logger
   * @returns {Promise<ReadonlyArray<Readonly<BizLocation>>>}
   * @memberof MongoDb
   */
  async getLocationsByUserId(userId: string, options: object, logger: Logger):
  Promise<ReadonlyArray<Readonly<BizLocation>>> {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByUserId({
      db, userId, options, logger,
    });
  }

  /**
   * Role at Location
   * @param {string} locationId
   * @param {string} userId
   * @param {Role[]} roles
   * @param {Logger} logger
   * @returns {Promise<boolean>}
   * @memberof MongoDb
   */
  async roleAtLocation(locationId: string, userId: string, roles: Role[], logger: Logger):
  Promise<boolean> {
    const db = await this.GetDb(logger);
    return modelLocation.roleAtLocation({
      db, locationId, userId, roles, logger,
    });
  }

  // Location U: updateLocation

  /**
   * Update location by Id
   * @param {BizLocation} location
   * @param {string} loggedInUserId
   * @param {Logger} logger
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   * @memberof MongoDb
   */
  async updateLocationById(location: BizLocation, loggedInUserId: string, logger: Logger):
  Promise<import('mongodb').UpdateWriteOpResult> {
    const db = await this.GetDb(logger);
    return modelLocation.updateLocationById({
      db, location, loggedInUserId, logger,
    });
  }

  // Location D: deleteLocation

  /**
   * Delete location
   * @param {string} _id
   * @param {string} loggedInUserId
   * @param {Logger} logger
   * @returns {Promise<number|undefined>}
   * @memberof MongoDb
   */
  async deleteLocation(_id: string, loggedInUserId: string, logger: Logger):
  Promise<number | undefined> {
    const db = await this.GetDb(logger);
    return modelLocation.deleteLocation({
      db, _id, loggedInUserId,
    });
  }

  // End CRUD methods for Location collection

  /**
   * Read the documents from a collection
   * @param {DbCollectionName} collection - the collection being read from
   * @param {object} query - the filter to apply to the read
   * @param {Logger} logger
   * @returns {Promise<DbShapes|null>}
   */
  async queryByCollection(collection: DbCollectionName, query: object, logger: Logger):
  Promise<DbShapes | null> {
    try {
      const db = await this.GetDb(logger);
      const options = {};
      return readByCollection(db, collection, query, options);
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'queryByCollection',
        error,
        collection,
        query,
      });
      throw error;
    }
  }


  // Temporary function for setting the location value in the plant collection
  // _setLocation(userId, locationId, cb) {
  //   // eslint-disable-next-line no-param-reassign
  //   userId = typeof userId === 'string' ? new ObjectID(userId) : userId;
  //   // eslint-disable-next-line no-param-reassign
  //   locationId = typeof locationId === 'string' ? new ObjectID(locationId) : locationId;
  //   this.GetDb((err, db) => {
  //     const query = { userId };
  //     const set = { $set: { locationId } };
  //     Update.updateMany(db, 'plant', query, set, (updateLocationError, results) =>
  //       // results => {n:1, nModified:1, ok:1}
  //       cb(updateLocationError, results));
  //   });
  // }

  // _getAllUsersOnly(cb) {
  //   this.GetDb((err, db) => {
  //     read(db, 'user', {}, {});
  //   });
  // }
}

/**
 * @type {MongoDb}
 */
let dbInstance: MongoDb;

/**
 * gets the singleton instance of the DB class
 * @param {string=} connection
 * @returns {MongoDb}
 */
export function getDbInstance(connection?: string): MongoDb {
  if (!dbInstance) {
    dbInstance = new MongoDb(connection);
  }
  return dbInstance;
}
