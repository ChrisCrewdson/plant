const _ = require('lodash');
const mongodb = require('mongodb');

const constants = require('../../../app/libs/constants');
const read = require('./read');
const Create = require('./create');
const Update = require('./update');
const remove = require('./delete');
const utils = require('../../../app/libs/utils');
const modelLocation = require('./model-location');
const dbHelper = require('./helper');

const moduleName = 'lib/db/mongo/index';

const { ObjectID, MongoClient } = mongodb;

const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${process.env.PLANT_DB_NAME || 'plant'}`;

// This stores a cache of the user's location
const locationLocCache = {};

/**
 * Given a collection of users and locations return a collection of users
 * with the locationIds populated for each user.
 * The Mongo ObjectIds should have already been stringified in each collection
 * @param {Object[]} users - an array of user object
 * @param {string} users._id - the user's id
 * @param {Object[]} locations - an array of location objects
 * @param {string} locations._id - the location's id
 * @returns {Object[]} an array of users, each now with a locationIds array of strings
 */
function getUsersWithLocations(users, locations) {
  return (users || []).map(user => ({
    ...user,
    locationIds: locations.reduce((acc, location) => {
      if (location.members[user._id]) {
        acc.push(location._id);
      }
      return acc;
    }, []),
  }));
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
  constructor(connection) {
    this.mConnection = connection;
  }

  // eslint-disable-next-line class-methods-use-this
  getDbConnection() {
    return mongoConnection;
  }

  /**
   * Get the DB connection to use for a CRUD operation.
   * If it doesn't exist then create it.
   * @return {Promise}
   */
  async GetDb(logger) {
    try {
      const { mConnection } = this;
      const connection = mConnection || mongoConnection;
      if (!this.db) {
        logger.trace({
          moduleName,
          msg: 'About to connect to MongoDB',
          connection,
        });
        logger.time('connect-to-mongo');
        this.client = await MongoClient.connect(connection);
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
        mConnection: this.mConnection,
        mongoConnection,
      });
      throw err;
    }
  }

  async _close(logger) {
    logger.trace({ moduleName, msg: 'Closing DB Connection.' });
    try {
      const db = await this.GetDb(logger);
      await db.close(true);
    } catch (closeErr) {
      logger.error({ moduleName, msg: 'Error calling db.close()', closeErr });
    }
  }


  // CRUD operations for User collection

  // User CR: Create and Read are in a single function for user

  /**
   * Gets the user from the user collection based on the user's facebook id.
   * If the user does not exist then creates the user first.
   * @param {object} userDetails - the object that Facebook OAuth returns
   * @param {Function} cb - callback function with result
   * @return {undefined}
   */
  async findOrCreateUser(userDetails, logger) {
    try {
      if (!_.get(userDetails, 'facebook.id') && !_.get(userDetails, 'google.id')) {
        throw new Error('No facebook.id or google.id:', JSON.stringify(userDetails));
      }
      // 1. Get the DB
      const db = await this.GetDb(logger);

      // 2. Set the query to find the user
      const queryBySocialMedia = userDetails.facebook
        ? {
          'facebook.id': userDetails.facebook.id,
        }
        : {
          'google.id': userDetails.google.id,
        };

      // 3. Find the user by OAuth provider id
      let user = await read(db, 'user', queryBySocialMedia, {});

      if (user && user.length !== 1) {
        logger.error({ moduleName, msg: `Unexpected user.length: ${user.length}`, user });
      }

      if (user && user.length > 0) {
        // eslint-disable-next-line no-param-reassign
        user = dbHelper.convertIdToString(user[0]);
      }

      // 4. If user not found then try find by email
      if (!user) {
        if (userDetails.email) {
        // eslint-disable-next-line no-param-reassign
          const queryByEmail = {
            email: userDetails.email,
          };
          user = await read(db, 'user', queryByEmail, {});
        }
      }

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
          await Update.updateOne(db, 'user', query, userData);
        } catch (err) {
          logger.error({
            moduleName, msg: 'Error in user update', query, err,
          });
          throw err;
        }
      }

      // 6. Create user
      if (user) {
        const locations = await this.getLocationsByUserId(user._id, {}, logger);
        user.locationIds = locations;
      } else {
        user = await Create.createOne(db, 'user', userDetails);
        dbHelper.convertIdToString(user);
        const location = {
          createdBy: user._id,
          members: { [user._id]: 'owner' },
          stations: {},
          title: `${user.name || ''} Yard`,
        };
        await this.createLocation(location, logger);
        const locations = await this.getLocationsByUserId(user._id, {}, logger);
        user.locationIds = locations;
      }

      return user;
    } catch (error) {
      logger.error({ moduleName, msg: 'findOrCreateUser Error', error });
      throw error;
    }
  }

  // User R: Read user
  async getUserByQuery(query, logger) {
    try {
      const db = await this.GetDb(logger);
      const options = {
        projection: { _id: 1, name: 1, createdAt: 1 },
      };

      const users = await read(db, 'user', query, options);

      return users;
    } catch (readUserError) {
      logger.error({
        moduleName, msg: 'getUserByQuery readUserError:', err: readUserError, query,
      });
      throw readUserError;
    }
  }

  async getUserById(userId, logger) {
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
          logger.error({
            moduleName,
            msg: `Unexpected users.length: ${users.length}`,
            users,
          });
        }

        // Use this in the Mongo REPL:
        // db.location.find({ 'members.57b4e90d9f0e4e114b44bcf8' : {$exists: true} })
        // In the location collection the members object has the user's id as a key/prop
        // and the value is a string with the role.
        // This query checks if that user's id is in the members object.
        const locations = await this.getLocationsByUserId(users[0]._id, {
          locationsOnly: true,
        }, logger);

        // Convert Mongo ObjectIds to strings
        const user = dbHelper.convertIdToString(users[0]);
        user.locationIds = (locations || []).map(({ _id }) => _id.toString());
        return _.pick(user, ['_id', 'name', 'createdAt', 'locationIds']);
      }

      logger.warn({ moduleName, msg: 'No user found in query', userQuery });
      return undefined; // for lint
    } catch (err) {
      logger.error({ moduleName, msg: 'getUserById', userId });
      throw err;
    }
  }

  // User U: Update user

  async _updateUser(user, logger) {
    const _id = typeof user._id === 'string' ? new ObjectID(user._id) : user._id;
    const db = await this.GetDb(logger);
    const query = { _id };
    const set = _.omit(user, ['_id']);
    return Update.updateOne(db, 'user', query, set);
  }

  // User D: No Delete function for User yet
  // End CRUD methods for collection "user"

  // CRUD operations for Plant collection

  // Plant C: cratePlant

  // eslint-disable-next-line class-methods-use-this
  convertPlantDataTypesForSaving(plant) {
    if (plant._id) {
      // eslint-disable-next-line no-param-reassign
      plant._id = new ObjectID(plant._id);
    }
    // eslint-disable-next-line no-param-reassign
    plant.userId = new ObjectID(plant.userId);
    // eslint-disable-next-line no-param-reassign
    plant.locationId = new ObjectID(plant.locationId);
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach((dateField) => {
      if (plant[dateField]) {
        // eslint-disable-next-line no-param-reassign
        plant[dateField] = utils.dateToInt(plant[dateField]);
      }
    });
  }

  /**
   * Rebases a plant based on the location's loc value
   * @param {object} plant - plant object with a loc property that needs rebasing
   * @param {object} loc - the location's loc object
   * @returns {object} - the rebased plant object.
   */
  // eslint-disable-next-line class-methods-use-this
  rebasePlant(plant, loc) {
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
   * @param {object} plant - the plant which needs the loc rebased
   * @param {function} cb - function to call once done
   * @returns {undefined}
   */
  async rebasePlantByLoc(plant, logger) {
    if (locationLocCache[plant.locationId]) {
      return this.rebasePlant(plant, locationLocCache[plant.locationId]);
    }
    const db = await this.GetDb(logger);
    const locationQuery = {
      _id: new ObjectID(plant.locationId),
    };
    const options = {};
    try {
      const locations = await read(db, 'location', locationQuery, options);
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

      await Update.updateOne(db, 'location', locationQuery, locat);
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

  async convertPlantDataForRead(plant, loggedInUserId, logger) {
    if (!plant) {
      return plant;
    }
    if (_.isArray(plant)) {
      const _this = this;
      const promises = plant.map(p => _this.convertPlantDataForRead(p, loggedInUserId, logger));
      return Promise.all(promises);
    }

    const convertedPlant = dbHelper.convertIdToString(plant);
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

  async createPlant(plant, loggedInUserId, logger) {
    try {
      const db = await this.GetDb(logger);
      if (!plant.userId) {
        logger.warn({ moduleName, msg: 'Missing plant.userId', plant });
        throw new Error('userId must be specified as part of plant when creating a plant');
      }
      const isAuthorized = await this.roleAtLocation(plant.locationId, loggedInUserId, ['owner', 'manager'], logger);
      if (isAuthorized) {
        this.convertPlantDataTypesForSaving(plant);
        const createdPlant = await Create.createOne(db, 'plant', plant);
        const convertedPlant = await this
          .convertPlantDataForRead(createdPlant, loggedInUserId, logger);
        return convertedPlant;
      }
      throw new Error('Logged in user not authorized to create plant at this location');
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'createPlant',
        error,
        plant,
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
   * @param {string} loggedInUserId - the id of the user currently logged in or falsey if
   *   anonymous request
   * @param {Function} cb - callback for result
   * @returns {undefined}
   */
  async getPlantById(plantId, loggedInUserId, logger) {
    if (!constants.mongoIdRE.test(plantId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb(logger);
      const query = {
        _id: new ObjectID(plantId),
      };
      const options = {};

      const plants = await read(db, 'plant', query, options);
      if (plants && plants.length === 1) {
        const noteQuery = { plantIds: plants[0]._id };
        const noteOptions = {
          projection: { _id: 1 },
          sort: [['date', 'asc']],
        };
        const notes = await read(db, 'note', noteQuery, noteOptions);

        // Convert Mongo ObjectIds to strings
        const plant = await this.convertPlantDataForRead(plants[0], loggedInUserId, logger);

        plant.notes = (notes || []).map(note => note._id.toString());
        return plant;
      }

      // readError and plant are both falsey
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
   * @param {string} loggedInUserId - the id of the user currently logged in or
   *   falsey if anonymous request
   * @param {Function} cb - callback for result
   * @return {undefined}
   */
  async getPlantsByLocationId(locationId, loggedInUserId, logger) {
    if (!constants.mongoIdRE.test(locationId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb(logger);
      const _id = new ObjectID(locationId);
      const options = {};

      const locations = await read(db, 'location', { _id }, options);
      if (locations && locations.length > 0) {
        const plantQuery = { locationId: _id };
        const plantOptions = { sort: [['title', 'asc']] };
        const plants = await read(db, 'plant', plantQuery, plantOptions);
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

  async getPlantsByIds(ids, loggedInUserId, logger) {
    try {
      const plantQuery = {
        _id: { $in: ids.map(id => new ObjectID(id)) },
      };
      const plantOptions = { sort: [['title', 'asc']] };
      const db = await this.GetDb(logger);
      const plants = await read(db, 'plant', plantQuery, plantOptions);
      return this.convertPlantDataForRead(plants || [], loggedInUserId, logger);
    } catch (error) {
      logger.error({ moduleName, msg: 'getPlantsByIds', error });
      throw error;
    }
  }

  // Plant U: updatePlant

  async updatePlant(plant, loggedInUserId, logger) {
    try {
      if (!plant._id || !plant.userId) {
        throw new Error(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
      }
      this.convertPlantDataTypesForSaving(plant);
      const db = await this.GetDb(logger);
      const query = _.pick(plant, ['_id', 'userId']);
      const set = _.omit(plant, ['_id']);
      await Update.updateOne(db, 'plant', query, set);
      return this.convertPlantDataForRead(plant, loggedInUserId, logger);
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'updatePlant',
        error,
        plant,
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
   * @param {string} _id - Id of plant to delete
   * @param {string} userId - Id of user that plant belongs to
   * @param {function} cb - callback to call once complete
   * @returns {undefined}
   */
  async deletePlant(_id, userId, logger) {
    // Steps to delete a plant
    // 1. Retrieve note documents associated with Plant
    // 2. Delete note documents that only reference this plant
    // 3. Update note documents that reference multiple plants by remove the
    //    reference to this plant.
    // 4. Delete plant document.
    try {
      const db = await this.GetDb(logger);
      // eslint-disable-next-line no-param-reassign
      _id = new ObjectID(_id);
      // eslint-disable-next-line no-param-reassign
      userId = new ObjectID(userId);

      const noteQuery = { plantIds: _id, userId };
      const noteOptions = { sort: [['date', 'asc']] };

      const notesForPlant = await read(db, 'note', noteQuery, noteOptions);
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
      }, { singlePlantNotes: [], multiplePlantNotes: [] });


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
        const updatedNotes = multiplePlantNotes.map(note => Object.assign(
          {},
          note,
          { plantIds: note.plantIds.filter(plantId => plantId !== _id) },
        ));
        const promises = updatedNotes.map((updateNote) => {
          const noteUpdateQuery = { _id: updateNote._id };
          const set = _.omit(updateNote, ['_id']);
          return Update.updateOne(db, 'note', noteUpdateQuery, set);
        });
        await Promise.all(promises);
      }

      return remove(db, 'plant', { _id, userId });
    } catch (error) {
      logger.error({
        moduleName,
        msg: 'deletePlant',
        error,
        _id,
        userId,
      });
      throw error;
    }
  }

  // Only used for testing - so far - needs to delete notes as well if to be used in prod
  async deleteAllPlantsByUserId(userId, logger) {
    const db = await this.GetDb(logger);
    // eslint-disable-next-line no-param-reassign
    userId = new ObjectID(userId);
    return remove(db, 'plant', { userId });
  }

  // End CRUD methods for Plant collection

  // CRUD operations for Note collection

  // Note C: createNote

  // eslint-disable-next-line class-methods-use-this
  convertNoteDataTypesForSaving(note) {
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
      note.plantIds = note.plantIds.map(plantId => new ObjectID(plantId));
    }
    // eslint-disable-next-line no-param-reassign
    note.userId = new ObjectID(note.userId);
  }

  convertNoteDataForRead(note, logger) {
    if (!note) {
      return note;
    }
    if (_.isArray(note)) {
      return note.map(n => this.convertNoteDataForRead(n, logger));
    }
    const convertedNote = dbHelper.convertIdToString(note);
    if (convertedNote.userId) {
      convertedNote.userId = convertedNote.userId.toString();
    } else {
      logger.error({
        moduleName, msg: 'In convertNoteDataForRead() there is no userId', note, convertedNote,
      });
    }
    if (convertedNote.plantIds && convertedNote.plantIds.length) {
      convertedNote.plantIds = (convertedNote.plantIds || []).map(plantId => plantId.toString());
    }
    return convertedNote;
  }

  async createNote(note, logger) {
    try {
      const db = await this.GetDb(logger);
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when creating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      // eslint-disable-next-line no-param-reassign
      note.plantIds = note.plantIds || [];
      const createdNote = await Create.createOne(db, 'note', note);
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

  async getNotesByQuery(query, logger) {
    try {
      const db = await this.GetDb(logger);
      const noteOptions = { sort: [['date', 'asc']] };
      const notes = await read(db, 'note', query, noteOptions);

      if (notes && notes.length > 0) {
        return this.convertNoteDataForRead(notes, logger);
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

  async getNoteByQuery(query, logger) {
    try {
      const notes = await this.getNotesByQuery(query, logger);
      if (!notes || !notes.length) {
        return notes;
      }
      if (notes.length > 1) {
        throw new Error(`Only expecting 1 note back in getNoteByQuery but got ${notes.length}`);
      }
      return this.convertNoteDataForRead(notes[0], logger);
    } catch (error) {
      logger.error({ moduleName, msg: 'getNoteByQuery', query });
      throw error;
    }
  }

  async getNoteById(id, logger) {
    const _id = new ObjectID(id);
    return this.getNoteByQuery({ _id }, logger);
  }

  async getNoteByImageId(imageId, logger) {
    const query = {
      images: { $elemMatch: { id: imageId } },
    };
    return this.getNoteByQuery(query, logger);
  }

  async getNotesByIds(ids, logger) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    return this.getNotesByQuery(query, logger);
  }

  async getNotesLatest(qty, logger) {
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

  async getNotesWithPlants(notesCopy, logger) {
    try {
    // Grab the plant ids off each note (can be more than 1 per note)
      const myPlantIds = notesCopy.reduce((acc, { plantIds }) => acc.concat(plantIds), []);

      const plants = await this.getPlantsByIds(_.uniq(myPlantIds), null, logger);

      const notes = notesCopy.map((note) => {
        const plantIds = note.plantIds.map(pId => pId.toString());
        return {
          ...note,
          plants: plants.filter(plant => plantIds.includes(plant._id)),
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

  getNotesByPlantId(plantId, logger) {
    const query = { plantIds: new ObjectID(plantId) };
    return this.getNotesByQuery(query, logger);
  }

  getNotesByPlantIds(plantIds, logger) {
    const query = {
      plantIds: {
        $in: plantIds.map(plantId => new ObjectID(plantId)),
      },
    };
    return this.getNotesByQuery(query, logger);
  }

  // Note U: updateNote

  async updateNote(note, logger) {
    try {
      const db = await this.GetDb(logger);
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      const query = _.pick(note, ['_id', 'userId']);
      const set = _.omit(note, ['_id']);
      await Update.updateOne(db, 'note', query, set);
      // results => {n:1, nModified:1, ok:1}
      return this.convertNoteDataForRead(note, logger);
    } catch (error) {
      logger.error({
        moduleName, msg: 'updateNote', error, note,
      });
      throw error;
    }
  }

  async addSizesToNoteImage(noteUpdate, logger) {
    try {
      const db = await this.GetDb(logger);
      if (!noteUpdate.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(noteUpdate);
      const query = _.pick(noteUpdate, ['_id', 'userId']);
      query.images = { $elemMatch: { id: noteUpdate.imageId } };
      const set = { $set: { 'images.$.sizes': noteUpdate.sizes } };
      logger.trace({
        moduleName, msg: 'mongo.addSizesToNoteImage', query, set,
      });
      const result = await Update.updateOne(db, 'note', query, set);
      return result;
    } catch (error) {
      logger.error({
        moduleName, msg: 'addSizesToNoteImage', error, noteUpdate,
      });
      throw error;
    }
  }

  // Note UI: upsertNote

  async upsertNote(note, logger) {
    try {
      const { _id } = note;
      const foundNote = await this.getNoteById(_id, logger);
      return foundNote
        ? await this.updateNote(note, logger)
        : await this.createNote(note, logger);
    } catch (error) {
      logger.error({
        moduleName, msg: 'upsertNote', error, note,
      });
      throw error;
    }
  }

  // Note D: deleteNote

  async deleteNote(_id, userId, logger) {
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

  async createLocation(loc, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.createLocation({ db, loc, logger });
  }

  // Location R: getLocationById

  async getAllUsers(logger) {
    try {
      const db = await this.GetDb(logger);
      const userQuery = {};
      const userOptions = {
        projection: { _id: 1, name: 1, createdAt: 1 },
      };

      let users = await read(db, 'user', userQuery, userOptions);
      users = dbHelper.convertIdToString(users);

      const locationQuery = {};
      const locationOptions = {
        projection: { _id: true, members: true },
      };
      const locations = await read(db, 'location', locationQuery, locationOptions);
      modelLocation.convertLocationDataForRead({ loc: locations });
      const usersWithlocationIds = getUsersWithLocations(users, locations);
      return usersWithlocationIds;
    } catch (error) {
      logger.error({ moduleName, msg: 'getAllUsers', error });
      throw error;
    }
  }

  async getLocationsByQuery(query, options, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByQuery({
      db, query, options, logger,
    });
  }

  async getAllLocations(logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getAllLocations({ db, logger });
  }

  async getLocationById(id, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationById({ db, id, logger });
  }

  async getLocationOnlyById(id, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationOnlyById({ db, id, logger });
  }

  async getLocationsByIds(ids, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByIds({ db, ids, logger });
  }

  async getLocationsByUserId(userId, options, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.getLocationsByUserId({
      db, userId, options, logger,
    });
  }

  async roleAtLocation(locationId, userId, roles, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.roleAtLocation({
      db, locationId, userId, roles, logger,
    });
  }

  // Location U: updateLocation

  async updateLocationById(location, loggedInUserId, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.updateLocationById({
      db, location, loggedInUserId, logger,
    });
  }

  // Location D: deleteLocation

  async deleteLocation(_id, loggedInUserId, logger) {
    const db = await this.GetDb(logger);
    return modelLocation.deleteLocation({
      db, _id, loggedInUserId, logger,
    });
  }

  // End CRUD methods for Location collection

  /**
   * Wholesale replace a document in any collection. Uses the documents _id prop.
   * @param {string} collection - the collection being updated
   * @param {Object} doc - the document to replace
   * @param {Function} cb - the callback function
   */
  /*
  This method commented because not currently being used.
  Before uncommenting make sure that it's working correctly with code coverage.
  The MongoDB driver requires an atomic operation on update.

   async replaceDocument(collection, doc) {
    try {
      const db = await this.GetDb(logger);
      if (!doc._id) {
        throw new Error('Must have _id to do a wholesale update');
      }

      switch (collection) {
        case 'location':
          this.convertLocationDataTypesForSaving(doc);
          break;
        default:
          throw new Error(`Collection type "${collection}" not implemented in updateWholesale yet`);
      }

      return Update.replaceOne(db, collection, doc);
    } catch (error) {
      logger.error({moduleName, msg: 'replaceDocument', error, collection, doc });
      throw error;
    }
  }
*/

  /**
   * Read the documents from a collection
   * @param {string} collection - the collection being read from
   * @param {Object} query - the filter to apply to the read
   * @param {Function} cb - the callback function
   */
  async queryByCollection(collection, query, logger) {
    try {
      const db = await this.GetDb(logger);
      const options = {};
      return read(db, collection, query, options);
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

let dbInstance;
function getDbInstance(connection) {
  if (!dbInstance) {
    dbInstance = new MongoDb(connection);
  }
  return dbInstance;
}

module.exports = getDbInstance;
