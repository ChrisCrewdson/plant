const _ = require('lodash');
const constants = require('../../../app/libs/constants');
const read = require('./read');
const Create = require('./create');
const Update = require('./update');
const remove = require('./delete');
const mongodb = require('mongodb');
const utils = require('../../../app/libs/utils');
const modelLocation = require('./model-location');
const dbHelper = require('./helper');

const { ObjectID, MongoClient } = mongodb;

const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${process.env.PLANT_DB_NAME || 'plant'}`;

const logger = require('../../logging/logger').create('mongo-index');

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
    // Call GetDb() to setup connection but don't need to use it.
    // This just makes the app spin up a bit faster.
    this.GetDb();
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
  async GetDb() {
    try {
      const { mConnection } = this;
      const connection = mConnection || mongoConnection;
      logger.trace('mongoConnection', { connection });
      if (!this.db) {
        this.client = await MongoClient.connect(connection);
        const parts = connection.split('/');
        this.db = this.client.db(parts.pop());
      }
      return this.db;
    } catch (err) {
      logger.error('Connection to mongo failed:', {
        err,
        mConnection: this.mConnection,
        mongoConnection,
      });
      throw err;
    }
  }

  async _close() {
    logger.trace('Closing DB Connection.');
    try {
      const db = await this.GetDb();
      await db.close(true);
    } catch (closeErr) {
      logger.error('Error calling db.close()', { closeErr });
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
  async findOrCreateUser(userDetails) {
    try {
      if (!_.get(userDetails, 'facebook.id') && !_.get(userDetails, 'google.id')) {
        throw new Error('No facebook.id or google.id:', JSON.stringify(userDetails));
      }
      // 1. Get the DB
      const db = await this.GetDb();

      // 2. Set the query to find the user
      const queryBySocialMedia = userDetails.facebook
        ? {
          'facebook.id': userDetails.facebook.id,
        }
        : {
          'google.id': userDetails.google.id,
        };

      // 3. Find the user by OAuth provider id
      let user = await read(db, 'user', queryBySocialMedia, {}, {});

      if (user && user.length !== 1) {
        logger.error(`Unexpected user.length: ${user.length}`, { user });
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
          user = await read(db, 'user', queryByEmail, {}, {});
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
          logger.error('Error in user update', { query }, { err });
          throw err;
        }
      }

      // 6. Create user
      if (user) {
        const locations = await this.getLocationsByUserId(user._id);
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
        await this.createLocation(location);
        const locations = await this.getLocationsByUserId(user._id);
        user.locationIds = locations;
      }

      return user;
    } catch (error) {
      logger.error('findOrCreateUser Error', { error });
      throw error;
    }
  }

  // User R: Read user
  async getUserByQuery(query) {
    try {
      const db = await this.GetDb();
      const fields = { _id: true, name: true, createdAt: true };
      const options = {};

      const users = await read(db, 'user', query, fields, options);

      return users;
    } catch (readUserError) {
      logger.error('getUserByQuery readUserError:', { readUserError, query });
      throw readUserError;
    }
  }

  async getUserNameByIds(userIds) {
    try {
      const userQuery = {
        _id: { $in: userIds.map(userId => new ObjectID(userId)) },
      };

      const users = await this.getUserByQuery(userQuery);
      if (users.length < 1) {
        logger.error(`Unexpected number of users users.length: ${users.length}`, { users });
      }

      return users.map(user => _.pick(user, ['_id', 'name']));
    } catch (getUserByQueryError) {
      throw getUserByQueryError;
    }
  }

  async getUserById(userId) {
    try {
      if (!constants.mongoIdRE.test(userId)) {
        return undefined; // for lint
      }
      const userQuery = {
        _id: new ObjectID(userId),
      };

      const users = await this.getUserByQuery(userQuery);
      if (users) {
        if (users.length !== 1) {
          logger.error(`Unexpected users.length: ${users.length}`, { users });
        }

        // Use this in the Mongo REPL:
        // db.location.find({ 'members.57b4e90d9f0e4e114b44bcf8' : {$exists: true} })
        // In the location collection the members object has the user's id as a key/prop
        // and the value is a string with the role.
        // This query checks if that user's id is in the members object.
        const locations = await this.getLocationsByUserId(users[0]._id, {
          locationsOnly: true,
        });

        // Convert Mongo ObjectIds to strings
        const user = dbHelper.convertIdToString(users[0]);
        user.locationIds = (locations || []).map(({ _id }) => _id.toString());
        return _.pick(user, ['_id', 'name', 'createdAt', 'locationIds']);
      }

      logger.warn('No user found in query', { userQuery });
      return undefined; // for lint
    } catch (err) {
      logger.error('getUserById', { userId });
      throw err;
    }
  }

  // User U: Update user

  async _updateUser(user) {
    const _id = typeof user._id === 'string' ? new ObjectID(user._id) : user._id;
    const db = await this.GetDb();
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
  async rebasePlantByLoc(plant) {
    if (locationLocCache[plant.locationId]) {
      return this.rebasePlant(plant, locationLocCache[plant.locationId]);
    }
    const db = await this.GetDb();
    const locationQuery = {
      _id: new ObjectID(plant.locationId),
    };
    const fields = {};
    const options = {};
    try {
      const locations = await read(db, 'location', locationQuery, fields, options);
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
      logger.error('rebasePlantByLoc readLocationError:', { readLocationError, locationQuery });
      // eslint-disable-next-line no-param-reassign
      delete plant.loc;
      throw readLocationError;
    }
  }

  async convertPlantDataForRead(plant, loggedInUserId) {
    if (!plant) {
      return plant;
    }
    if (_.isArray(plant)) {
      const _this = this;
      const promises = plant.map(p => _this.convertPlantDataForRead(p, loggedInUserId));
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
      return this.rebasePlantByLoc(convertedPlant);
    }
    return convertedPlant;
  }

  async createPlant(plant, loggedInUserId) {
    try {
      const db = await this.GetDb();
      if (!plant.userId) {
        logger.warn('Missing plant.userId', { plant });
        throw new Error('userId must be specified as part of plant when creating a plant');
      }
      const isAuthorized = await this.roleAtLocation(plant.locationId, loggedInUserId, ['owner', 'manager']);
      if (isAuthorized) {
        this.convertPlantDataTypesForSaving(plant);
        const createdPlant = await Create.createOne(db, 'plant', plant);
        const convertedPlant = await this.convertPlantDataForRead(createdPlant, loggedInUserId);
        return convertedPlant;
      }
      throw new Error('Logged in user not authorized to create plant at this location');
    } catch (error) {
      logger.error('createPlant', { error, plant, loggedInUserId });
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
  async getPlantById(plantId, loggedInUserId) {
    if (!constants.mongoIdRE.test(plantId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb();
      const query = {
        _id: new ObjectID(plantId),
      };
      const fields = {};
      const options = {};

      const plants = await read(db, 'plant', query, fields, options);
      if (plants && plants.length === 1) {
        const noteQuery = { plantIds: plants[0]._id };
        const noteFields = { _id: true };
        const noteOptions = { sort: [['date', 'asc']] };
        const notes = await read(db, 'note', noteQuery, noteFields, noteOptions);

        // Convert Mongo ObjectIds to strings
        const plant = await this.convertPlantDataForRead(plants[0], loggedInUserId);

        plant.notes = (notes || []).map(note => note._id.toString());
        return plant;
      }

      // readError and plant are both falsey
      logger.warn('No plant found in query', { query });
      return undefined;
    } catch (error) {
      logger.error('getPlantById', { error, plantId, loggedInUserId });
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
  async getPlantsByLocationId(locationId, loggedInUserId) {
    if (!constants.mongoIdRE.test(locationId)) {
      return undefined;
    }
    try {
      const db = await this.GetDb();
      const _id = new ObjectID(locationId);
      const fields = {};
      const options = {};

      const locations = await read(db, 'location', { _id }, fields, options);
      if (locations && locations.length > 0) {
        const plantQuery = { locationId: _id };
        const plantFields = {};
        const plantOptions = { sort: [['title', 'asc']] };
        const plants = await read(db, 'plant', plantQuery, plantFields, plantOptions);
        return this.convertPlantDataForRead(plants || [], loggedInUserId);
      }
      return undefined;
    } catch (error) {
      logger.error('getPlantsByLocationId', { error, locationId, loggedInUserId });
      throw error;
    }
  }

  async getPlantsByIds(ids, loggedInUserId) {
    try {
      const plantQuery = {
        _id: { $in: ids.map(id => new ObjectID(id)) },
      };
      const plantFields = {};
      const plantOptions = { sort: [['title', 'asc']] };
      const db = await this.GetDb();
      const plants = await read(db, 'plant', plantQuery, plantFields, plantOptions);
      return this.convertPlantDataForRead(plants || [], loggedInUserId);
    } catch (error) {
      logger.error('getPlantsByIds', { error });
      throw error;
    }
  }

  // Plant U: updatePlant

  async updatePlant(plant, loggedInUserId) {
    try {
      if (!plant._id || !plant.userId) {
        throw new Error(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
      }
      this.convertPlantDataTypesForSaving(plant);
      const db = await this.GetDb();
      const query = _.pick(plant, ['_id', 'userId']);
      const set = _.omit(plant, ['_id']);
      await Update.updateOne(db, 'plant', query, set);
      return this.convertPlantDataForRead(plant, loggedInUserId);
    } catch (error) {
      logger.error('updatePlant', { error, plant, loggedInUserId });
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
  async deletePlant(_id, userId) {
    // Steps to delete a plant
    // 1. Retrieve note documents associated with Plant
    // 2. Delete note documents that only reference this plant
    // 3. Update note documents that reference multiple plants by remove the
    //    reference to this plant.
    // 4. Delete plant document.
    try {
      const db = await this.GetDb();
      // eslint-disable-next-line no-param-reassign
      _id = new ObjectID(_id);
      // eslint-disable-next-line no-param-reassign
      userId = new ObjectID(userId);

      const noteQuery = { plantIds: _id, userId };
      const noteFields = {};
      const noteOptions = { sort: [['date', 'asc']] };

      const notesForPlant = await read(db, 'note', noteQuery, noteFields, noteOptions);
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
      logger.error('deletePlant', { error, _id, userId });
      throw error;
    }
  }

  // Only used for testing - so far - needs to delete notes as well if to be used in prod
  async deleteAllPlantsByUserId(userId) {
    const db = await this.GetDb();
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

  convertNoteDataForRead(note) {
    if (!note) {
      return note;
    }
    if (_.isArray(note)) {
      return note.map(this.convertNoteDataForRead, this);
    }
    const convertedNote = dbHelper.convertIdToString(note);
    if (convertedNote.userId) {
      convertedNote.userId = convertedNote.userId.toString();
    } else {
      logger.error('In convertNoteDataForRead() there is no userId', { note, convertedNote });
    }
    if (convertedNote.plantIds && convertedNote.plantIds.length) {
      convertedNote.plantIds = (convertedNote.plantIds || []).map(plantId => plantId.toString());
    }
    return convertedNote;
  }

  async createNote(note) {
    try {
      const db = await this.GetDb();
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when creating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      // eslint-disable-next-line no-param-reassign
      note.plantIds = note.plantIds || [];
      const createdNote = await Create.createOne(db, 'note', note);
      logger.trace('createdNote', { createdNote });
      return this.convertNoteDataForRead(createdNote);
    } catch (error) {
      logger.error('createNote', { error, note });
      throw error;
    }
  }

  // Note R: getNoteById

  async getNotesByQuery(query) {
    try {
      const db = await this.GetDb();
      const noteFields = {};
      const noteOptions = { sort: [['date', 'asc']] };
      const notes = await read(db, 'note', query, noteFields, noteOptions);

      if (notes && notes.length > 0) {
        return this.convertNoteDataForRead(notes);
      }
      // This is okay - will happen during an upsert
      logger.trace('getNotesByQuery nothing found', { query });
      return undefined;
    } catch (error) {
      logger.error('getNotesByQuery', { error, query });
      throw error;
    }
  }

  async getNoteByQuery(query) {
    try {
      const notes = await this.getNotesByQuery(query);
      if (!notes || !notes.length) {
        return notes;
      }
      if (notes.length > 1) {
        throw new Error(`Only expecting 1 note back in getNoteByQuery but got ${notes.length}`);
      }
      return this.convertNoteDataForRead(notes[0]);
    } catch (error) {
      logger.error('getNoteByQuery', { query });
      throw error;
    }
  }

  async getNoteById(id) {
    const _id = new ObjectID(id);
    return this.getNoteByQuery({ _id });
  }

  async getNoteByImageId(imageId) {
    const query = {
      images: { $elemMatch: { id: imageId } },
    };
    return this.getNoteByQuery(query);
  }

  async getNotesByIds(ids) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    return this.getNotesByQuery(query);
  }

  async getNotesLatest(qty) {
    // This method doesn't work with getNoteByQuery since we need .limit()
    // Calling Mongo directly from here, for now
    try {
      const db = await this.GetDb();
      const notes = await db.collection('note').find().sort({ date: -1 }).limit(qty)
        .toArray();

      return this.getNotesWithPlants(notes); // next step: match up with plant names
    } catch (error) {
      logger.error('getNotesLatest', { error, qty });
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

  async getNotesWithPlants(notesCopy) {
    try {
    // Grab the plant ids off each note (can be more than 1 per note)
      const myPlantIds = notesCopy.reduce((acc, { plantIds }) => acc.concat(plantIds), []);

      const plants = await this.getPlantsByIds(_.uniq(myPlantIds), null);

      const notes = notesCopy.map((note) => {
        const plantIds = note.plantIds.map(pId => pId.toString());
        return {
          ...note,
          plants: plants.filter(plant => plantIds.includes(plant._id)),
        };
      });

      return notes;
    } catch (error) {
      logger.error('getNotesWithPlants', { error, notesCopy });
      throw error;
    }
  }

  async getNotesByPlantId(plantId) {
    const query = { plantIds: new ObjectID(plantId) };
    return this.getNotesByQuery(query);
  }

  // Note U: updateNote

  async updateNote(note) {
    try {
      const db = await this.GetDb();
      if (!note.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      const query = _.pick(note, ['_id', 'userId']);
      const set = _.omit(note, ['_id']);
      await Update.updateOne(db, 'note', query, set);
      // results => {n:1, nModified:1, ok:1}
      return this.convertNoteDataForRead(note);
    } catch (error) {
      logger.error('updateNote', { error, note });
      throw error;
    }
  }

  async addSizesToNoteImage(noteUpdate) {
    try {
      const db = await this.GetDb();
      if (!noteUpdate.userId) {
        throw new Error('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(noteUpdate);
      const query = _.pick(noteUpdate, ['_id', 'userId']);
      query.images = { $elemMatch: { id: noteUpdate.imageId } };
      const set = { $set: { 'images.$.sizes': noteUpdate.sizes } };
      logger.info('mongo.addSizesToNoteImage', { query, set });
      const result = await Update.updateOne(db, 'note', query, set);
      return result;
    } catch (error) {
      logger.error('addSizesToNoteImage', { error, noteUpdate });
      throw error;
    }
  }

  // Note UI: upsertNote

  async upsertNote(note) {
    try {
      const { _id } = note;
      const foundNote = await this.getNoteById(_id);
      return foundNote
        ? await this.updateNote(note)
        : await this.createNote(note);
    } catch (error) {
      logger.error('upsertNote', { error, note });
      throw error;
    }
  }

  // Note D: deleteNote

  async deleteNote(_id, userId) {
    try {
      const db = await this.GetDb();
      return remove(db, 'note', {
        _id: new ObjectID(_id),
        userId: new ObjectID(userId),
      });
    } catch (error) {
      logger.error('deleteNote', { error, _id, userId });
      throw error;
    }
  }

  // End CRUD methods for Note collection

  // CRUD operations for Location collection

  // Location C: createLocation

  async createLocation(loc) {
    const db = await this.GetDb();
    return modelLocation.createLocation(db, loc);
  }

  // Location R: getLocationById

  async getAllUsers() {
    try {
      const db = await this.GetDb();
      const userQuery = {};
      const userFields = { _id: true, name: true, createdAt: true };
      const userOptions = {};

      let users = await read(db, 'user', userQuery, userFields, userOptions);
      users = dbHelper.convertIdToString(users);

      const locationQuery = {};
      const locationFields = { _id: true, members: true };
      const locationOptions = {};
      const locations = await read(db, 'location', locationQuery, locationFields, locationOptions);
      modelLocation.convertLocationDataForRead(locations);
      const usersWithlocationIds = getUsersWithLocations(users, locations);
      return usersWithlocationIds;
    } catch (error) {
      logger.error('getAllUsers', { error });
      throw error;
    }
  }

  async getLocationsByQuery(query, options) {
    const db = await this.GetDb();
    return modelLocation.getLocationsByQuery(db, query, options);
  }

  async getAllLocations() {
    const db = await this.GetDb();
    return modelLocation.getAllLocations(db);
  }

  async getLocationById(id) {
    const db = await this.GetDb();
    return modelLocation.getLocationById(db, id);
  }

  async getLocationOnlyById(id) {
    const db = await this.GetDb();
    return modelLocation.getLocationOnlyById(db, id);
  }

  async getLocationsByIds(ids) {
    const db = await this.GetDb();
    return modelLocation.getLocationsByIds(db, ids);
  }

  async getLocationsByUserId(userId, options) {
    const db = await this.GetDb();
    return modelLocation.getLocationsByUserId(db, userId, options);
  }

  async roleAtLocation(locationId, userId, roles) {
    const db = await this.GetDb();
    return modelLocation.roleAtLocation(db, locationId, userId, roles);
  }

  // Location U: updateLocation

  async updateLocationById(location, loggedInUserId) {
    const db = await this.GetDb();
    return modelLocation.updateLocationById(db, location, loggedInUserId);
  }

  // Location D: deleteLocation

  async deleteLocation(_id, loggedInUserId) {
    const db = await this.GetDb();
    return modelLocation.deleteLocation(db, _id, loggedInUserId);
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
      const db = await this.GetDb();
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
      logger.error('replaceDocument', { error, collection, doc });
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
  async queryByCollection(collection, query) {
    try {
      const db = await this.GetDb();
      const fields = {};
      const options = {};
      return read(db, collection, query, fields, options);
    } catch (error) {
      logger.error('queryByCollection', { error, collection, query });
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
  //     read(db, 'user', {}, {}, {}, cb);
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
