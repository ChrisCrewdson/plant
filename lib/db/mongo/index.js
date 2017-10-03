const _ = require('lodash');
const async = require('async');
const constants = require('../../../app/libs/constants');
const read = require('./read');
const Create = require('./create');
const Update = require('./update');
const remove = require('./delete');
const mongodb = require('mongodb');
const utils = require('../../../app/libs/utils');

const { ObjectID } = mongodb;

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
  constructor() {
    // Call GetDb() to setup connection but don't need to use it.
    // This just makes the app spin up a bit faster.
    this.GetDb(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  getDbConnection() {
    return mongoConnection;
  }

  /**
   * Get the DB connection to use for a CRUD operation.
   * If it doesn't exist then create it.
   * @param {Function} cb - callback to call with connection or error
   * @return {undefined}
   */
  GetDb(cb) {
    if (this.db) {
      return cb(null, this.db);
    }
    logger.trace('mongoConnection', { mongoConnection });
    return mongodb.MongoClient.connect(mongoConnection, (err, db) => {
      if (err) {
        logger.error(`Connection to ${mongoConnection} failed:`, { err });
        return cb(err);
      }
      logger.trace('DB successfully connected.');
      this.db = db;
      return cb(err, db);
    });
  }

  _close() {
    this.GetDb((getDbErr, db) => {
      logger.trace('Closing...', { getDbErr });
      // db.disconnect();
      db.close(true, (closeErr) => {
        logger.trace('Callback from close', { closeErr });
      });
    });
  }

  /**
   * Helper function to convert _id from MongoId to string. Used in reads
   * @param {object} obj - Object that might have an _id
   * @returns {object} - the same object with a converted _id
   */
  convertIdToString(obj) {
    if (_.isArray(obj)) {
      return obj.map(this.convertIdToString, this);
    }
    if (obj && obj._id) {
      // eslint-disable-next-line no-param-reassign
      obj._id = obj._id.toString();
    }
    return obj;
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
  findOrCreateUser(userDetails, cb) {
    // 1. Get the DB
    const getDb = (done) => {
      this.GetDb((err, db) => done(err, { db }));
    };

    // 2. data.db is now set
    //    Set the query to find the user
    const setQuery = (data, done) => {
      if (!_.get(userDetails, 'facebook.id') && !_.get(userDetails, 'google.id')) {
        return done(new Error('No facebook.id or google.id:', JSON.stringify(userDetails)));
      }

      // eslint-disable-next-line no-param-reassign
      data.query = userDetails.facebook
        ? {
          'facebook.id': userDetails.facebook.id,
        }
        : {
          'google.id': userDetails.google.id,
        };

      return done(null, data);
    };

    // 3. Find the user by OAuth provider id
    const getUser = (data, done) => {
      read(data.db, 'user', data.query, {}, {}, (readError, user) => {
        if (readError) {
          logger.error('user readError:', { readError });
          return done(readError);
        }

        if (user && user.length !== 1) {
          logger.error(`Unexpected user.length: ${user.length}`, { user });
        }

        if (user && user.length > 0) {
          // eslint-disable-next-line no-param-reassign
          data.user = this.convertIdToString(user[0]);
        }

        return done(null, data);
      });
    };

    // 4. If user not found then try find by email
    const getUserByEmail = (data, done) => {
      if (data.user) {
        return done(null, data);
      }
      if (userDetails.email) {
        // eslint-disable-next-line no-param-reassign
        data.query = {
          email: userDetails.email,
        };
        return getUser(data, done);
      }
      return done(null, data);
    };

    // 5. Update the user's details
    //    If they had previously signed in with Facebook and now with
    //    Google then theis will add their Google credentials to their
    //    account.
    //    If they've changed anything about themselves on the OAuth
    //    provider (e.g. updated an email address) then this will update
    //    that.
    const updateUser = (data, done) => {
      // If no user then skip this step
      if (!data.user) {
        return done(null, data);
      }
      _.merge(data.user, userDetails);
      const userData = _.omit(data.user, ['_id']);
      const query = { _id: new ObjectID(data.user._id) };
      return Update.updateOne(data.db, 'user', query, userData, (err, result) => {
        if (!result || result.n === 0) {
          logger.error('User not updated', { data, result, query });
          return done(`update did not update any docs with query: ${JSON.stringify(query)}`);
        }
        if (err) {
          logger.error('Error in user update', { data }, { err }, { result });
        }
        return done(err, data);
      });
    };

    // 6. Create user
    const createUser = (data, done) => {
      if (data.user) {
        this.getLocationsByUserId(data.user._id, (getLocationsByUserIdError, locations) => {
          // eslint-disable-next-line no-param-reassign
          data.user.locationIds = locations;
          return done(null, data.user);
        });
      } else {
        Create.createOne(data.db, 'user', userDetails, (createOneError, createdUser) => {
          this.convertIdToString(createdUser);
          if (createOneError) {
            return done(createOneError, createdUser);
          }
          const location = {
            createdBy: createdUser._id,
            members: { [createdUser._id]: 'owner' },
            stations: {},
            title: `${createdUser.name || ''} Yard`,
          };
          return this.createLocation(location, (/* createLocationError, createdLocation */) => {
            this.getLocationsByUserId(createdUser._id, (getLocationsByUserIdError, locations) => {
              // eslint-disable-next-line no-param-reassign
              createdUser.locationIds = locations;
              return done(createOneError, createdUser);
            });
          });
        });
      }
    };

    async.waterfall([
      getDb,
      setQuery,
      getUser,
      getUserByEmail,
      updateUser,
      createUser,
    ], cb);
  }

  // User R: Read user
  getUserByQuery(query, cb) {
    this.GetDb((err, db) => {
      const fields = { _id: true, name: true, createdAt: true };
      const options = {};

      read(db, 'user', query, fields, options, (readUserError, users) => {
        if (readUserError) {
          logger.error('getUserByQuery readUserError:', { readUserError, query });
          return cb(readUserError);
        }
        return cb(null, users);
      });
    });
  }

  getUserNameByIds(userIds, cb) {
    const userQuery = {
      _id: { $in: userIds.map(userId => new ObjectID(userId)) },
    };

    return this.getUserByQuery(userQuery, (getUserByQueryError, users) => {
      if (getUserByQueryError) {
        return cb(getUserByQueryError);
      } else if (users) {
        if (users.length < 1) {
          logger.error(`Unexpected number of users users.length: ${users.length}`, { users });
        }

        return cb(null, users.map(user => _.pick(user, ['_id', 'name'])));
      }

      logger.warn('No user found in query', { userQuery });
      return cb();
    });
  }

  getUserById(userId, cb) {
    if (!constants.mongoIdRE.test(userId)) {
      return cb();
    }
    const userQuery = {
      _id: new ObjectID(userId),
    };

    return this.getUserByQuery(userQuery, (getUserByQueryError, users) => {
      if (getUserByQueryError) {
        return cb(getUserByQueryError);
      } else if (users) {
        if (users.length !== 1) {
          logger.error(`Unexpected users.length: ${users.length}`, { users });
        }

        // Use this in the Mongo REPL:
        // db.location.find({ 'members.57b4e90d9f0e4e114b44bcf8' : {$exists: true} })
        // In the location collection the members object has the user's id as a key/prop
        // and the value is a string with the role.
        // This query checks if that user's id is in the members object.
        const locationQuery = { [`members.${users[0]._id}`]: { $exists: true } };
        return this.GetDb((err, db) => {
          read(db, 'location', locationQuery, { _id: true, members: true }, {}, (locationReadError, locations) => {
            // Convert Mongo ObjectIds to strings
            const user = this.convertIdToString(users[0]);
            user.locationIds = (locations || []).map(({ _id }) => _id.toString());
            return cb(null, _.pick(user, ['_id', 'name', 'createdAt', 'locationIds']));
          });
        });
      }

      logger.warn('No user found in query', { userQuery });
      return cb();
    });
  }

  // User U: Update user

  _updateUser(user, cb) {
    const _id = typeof user._id === 'string' ? new ObjectID(user._id) : user._id;
    this.GetDb((err, db) => {
      const query = { _id };
      const set = _.omit(user, ['_id']);
      Update.updateOne(db, 'user', query, set, updateUserError => cb(updateUserError, user));
    });
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
  rebasePlantByLoc(plant, cb) {
    if (locationLocCache[plant.locationId]) {
      return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
    }
    return this.GetDb((err, db) => {
      const locationQuery = {
        _id: new ObjectID(plant.locationId),
      };
      const fields = {};
      const options = {};

      read(db, 'location', locationQuery, fields, options, (readLocationError, locations) => {
        // Might have been cached by a parallel async call so check again
        if (locationLocCache[plant.locationId]) {
          return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
        }

        if (readLocationError) {
          logger.error('rebasePlantByLoc readLocationError:', { readLocationError, locationQuery });
          // eslint-disable-next-line no-param-reassign
          delete plant.loc;
          return cb(readLocationError, plant);
        }
        const locat = locations[0];
        if (locat.loc) {
          locationLocCache[plant.locationId] = locat.loc;
          return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
        }
        locationLocCache[plant.locationId] = plant.loc;
        locat.loc = plant.loc;

        return Update.updateOne(db, 'location', locationQuery, locat, updateLocationError =>
          cb(updateLocationError, this.rebasePlant(plant, locationLocCache[plant.locationId])));
      });
    });
  }

  convertPlantDataForRead(plant, loggedInUserId, cb) {
    if (!plant) {
      return plant;
    }
    if (_.isArray(plant)) {
      const _this = this;
      return async.map(plant, (p, done) => {
        _this.convertPlantDataForRead(p, loggedInUserId, done);
      }, cb);
    }

    const convertedPlant = this.convertIdToString(plant);
    if (convertedPlant.userId) {
      convertedPlant.userId = convertedPlant.userId.toString();
    }

    // Only return the geoLocation of the plant if it's the
    // logged in user requesting their own plant
    // TODO: Should be if the user has one of the roles of:
    //       'owner', 'manager', 'member'
    //       Do this by adding another param to the convertPlantDataForRead
    //       method to include location or locationMembers.
    if (convertedPlant.loc && convertedPlant.userId !== loggedInUserId) {
      return this.rebasePlantByLoc(convertedPlant, cb);
    }
    return cb(null, convertedPlant);
  }

  createPlant(plant, loggedInUserId, cb) {
    this.GetDb((err, db) => {
      if (!plant.userId) {
        logger.warn('Missing plant.userId', { plant });
        return cb('userId must be specified as part of plant when creating a plant');
      }
      return this.roleAtLocation(plant.locationId, loggedInUserId, ['owner', 'manager'],
        (roleAtLocationErr, isAuthorized) => {
          if (isAuthorized) {
            this.convertPlantDataTypesForSaving(plant);
            return Create.createOne(db, 'plant', plant, (createOnePlantErr, createdPlant) => {
              if (createOnePlantErr) {
                logger.error('createOne plant error', { createOnePlantErr });
                return cb(createOnePlantErr);
              }
              return this.convertPlantDataForRead(createdPlant, loggedInUserId, cb);
            });
          }
          if (roleAtLocationErr) {
            return cb(roleAtLocationErr);
          }
          const msg = 'Logged in user not authorized to create plant at this location';
          logger.error(msg, { plant, loggedInUserId });
          return cb(msg);
        });
    });
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
  getPlantById(plantId, loggedInUserId, cb) {
    if (!constants.mongoIdRE.test(plantId)) {
      return cb();
    }
    return this.GetDb((err, db) => {
      const query = {
        _id: new ObjectID(plantId),
      };
      const fields = {};
      const options = {};

      read(db, 'plant', query, fields, options, (readError, plants) => {
        if (readError) {
          logger.error('plant readError:', { readError });
          return cb(readError);
        } else if (plants) {
          if (plants.length !== 1) {
            logger.error(`Unexpected plant.length: ${plants.length}`, { plants });
          }
          // {_id: {$in: splitNotes.singlePlantNotes}}
          const noteQuery = { plantIds: plants[0]._id };
          const noteFields = { _id: true };
          const noteOptions = { sort: [['date', 'asc']] };
          return read(db, 'note', noteQuery, noteFields, noteOptions, (noteReadError, notes) => {
            if (noteReadError) {
              logger.error('note noteReadError', { noteReadError });
              return cb(noteReadError);
            }
            // Convert Mongo ObjectIds to strings
            return this.convertPlantDataForRead(plants[0], loggedInUserId,
              (convertPlantDataForReadError, plant) => {
                // eslint-disable-next-line no-param-reassign
                plant.notes = (notes || []).map(note => note._id.toString());
                return cb(readError, plant);
              });
          });
        }

        // readError and plant are both falsey
        logger.warn('No plant found in query', { query });
        return cb();
      });
    });
  }

  /**
   * Gets all the plants belonging to a Location. Does not populate the notes field.
   * @param {string} locationId - the locationId to query against the plant collection.
   * @param {string} loggedInUserId - the id of the user currently logged in or
   *   falsey if anonymous request
   * @param {Function} cb - callback for result
   * @return {undefined}
   */
  getPlantsByLocationId(locationId, loggedInUserId, cb) {
    if (!constants.mongoIdRE.test(locationId)) {
      return cb();
    }
    return this.GetDb((err, db) => {
      const _id = new ObjectID(locationId);
      const fields = {};
      const options = {};

      read(db, 'location', { _id }, fields, options, (readLocationError, locations) => {
        if (readLocationError) {
          logger.error('getPlantsByLocationId read location error', { readLocationError });
          return cb(readLocationError);
        }
        if (locations && locations.length > 0) {
          const plantQuery = { locationId: _id };
          const plantFields = {};
          const plantOptions = { sort: [['title', 'asc']] };
          return read(db, 'plant', plantQuery, plantFields, plantOptions, (readPlantError, plants) => {
            if (readPlantError) {
              logger.error('getPlantsByLocationId read plants by locationId error:', { readPlantError });
              return cb(readPlantError);
            }
            return this.convertPlantDataForRead(plants || [], loggedInUserId, cb);
          });
        }

        logger.error(`getPlantsByLocationId No location found for locationId ${locationId}`);
        return cb();
      });
    });
  }

  getPlantsByIds(ids, loggedInUserId, cb) {
    const plantQuery = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    const plantFields = {};
    const plantOptions = { sort: [['title', 'asc']] };
    this.GetDb((err, db) => {
      read(db, 'plant', plantQuery, plantFields, plantOptions, (readPlantError, plants) => {
        if (readPlantError) {
          logger.error('getPlantsByIds read plants by ids error:', { readPlantError });
          return cb(readPlantError);
        }
        return this.convertPlantDataForRead(plants || [], loggedInUserId, cb);
      });
    });
  }

  // Plant U: updatePlant

  updatePlant(plant, loggedInUserId, cb) {
    if (!plant._id || !plant.userId) {
      logger.error(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
      return cb(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
    }
    this.convertPlantDataTypesForSaving(plant);
    return this.GetDb((err, db) => {
      const query = _.pick(plant, ['_id', 'userId']);
      const set = _.omit(plant, ['_id']);
      Update.updateOne(db, 'plant', query, set, (updatePlantError) => {
        this.convertPlantDataForRead(plant, loggedInUserId,
          (convertPlantDataForReadErr, convertedPlant) => cb(updatePlantError, convertedPlant));
      });
    });
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
  deletePlant(_id, userId, cb) {
    // Steps to delete a plant
    // 1. Retrieve note documents associated with Plant
    // 2. Delete note documents that only reference this plant
    // 3. Update note documents that reference multiple plants by remove the
    //    reference to this plant.
    // 4. Delete plant document.
    this.GetDb((err, db) => {
      // eslint-disable-next-line no-param-reassign
      _id = new ObjectID(_id);
      // eslint-disable-next-line no-param-reassign
      userId = new ObjectID(userId);

      function getNotes(done) {
        const noteQuery = { plantIds: _id, userId };
        const noteFields = {};
        const noteOptions = { sort: [['date', 'asc']] };

        read(db, 'note', noteQuery, noteFields, noteOptions, (getNotesError, notesForPlant) => {
          if (getNotesError) {
            return done(getNotesError);
          }
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
          return done(null, splitNotes);
        });
      }

      function deleteNotes(splitNotes, done) {
        // TODO: Confirm that this does a bulk delete
        // Need tests where noteIds end up being array of:
        // 0, 1, 2 in length
        if (splitNotes.singlePlantNotes.length > 0) {
          const deleteQuery = { _id: { $in: splitNotes.singlePlantNotes } };
          remove(db, 'note', deleteQuery)
            .then(() => done(null, splitNotes.multiplePlantNotes))
            .catch((removeNoteErr) => {
              logger.error('deleteNotes removeNoteErr', { removeNoteErr });
              // TODO: Add a check that the number of documents removed in removeNoteResults
              // is same as length of array passed to _id.
              // Don't need the singlePlantNotes anymore so don't need to pass them on.
              done(removeNoteErr, splitNotes.multiplePlantNotes);
            });
        } else {
          done(null, splitNotes.multiplePlantNotes);
        }
      }

      function updateNotes(multiplePlantNotes, done) {
        if (multiplePlantNotes.length > 0) {
          const updatedNotes = multiplePlantNotes.map(note => Object.assign({},
            note,
            { plantIds: note.plantIds.filter(plantId => plantId !== _id) },
          ));
          return async.each(updatedNotes, (updateNote, eachDone) => {
            const noteQuery = { _id: updateNote._id };
            const set = _.omit(updateNote, ['_id']);
            Update.updateOne(db, 'note', noteQuery, set, eachDone);
          }, (eachDoneErr) => {
            if (eachDoneErr) {
              logger.error('updateNotes error', { eachDoneErr });
            }
            return done(eachDoneErr);
          });
        }
        return done();
      }

      function deletePlant(done) {
        remove(db, 'plant', { _id, userId })
          .then(deletedCount => done(null, deletedCount))
          .catch(error => done(error));
      }

      async.waterfall([getNotes, deleteNotes, updateNotes, deletePlant],
        (waterfallError, deleteResult) => {
          if (waterfallError) {
            logger.error('delete plant finished with error', { waterfallError });
          }
          cb(waterfallError, deleteResult);
        });
    });
  }

  // Only used for testing - so far - needs to delete notes as well if to be used in prod
  deleteAllPlantsByUserId(userId, cb) {
    this.GetDb((err, db) => {
      // eslint-disable-next-line no-param-reassign
      userId = new ObjectID(userId);
      remove(db, 'plant', { userId })
        .then(deletedCount => cb(null, deletedCount))
        .catch(error => cb(error));
    });
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
    const convertedNote = this.convertIdToString(note);
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

  createNote(note, cb) {
    this.GetDb((err, db) => {
      if (!note.userId) {
        logger.error('userId must be specified as part of note when creating a note', { note });
        return cb('userId must be specified as part of note when creating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      // eslint-disable-next-line no-param-reassign
      note.plantIds = note.plantIds || [];
      return Create.createOne(db, 'note', note, (createOneError, createdNote) => {
        logger.trace('createdNote', { createdNote });
        return cb(createOneError, this.convertNoteDataForRead(createdNote));
      });
    });
  }

  // Note R: getNoteById

  getNotesByQuery(query, cb) {
    this.GetDb((err, db) => {
      const noteFields = {};
      const noteOptions = { sort: [['date', 'asc']] };
      read(db, 'note', query, noteFields, noteOptions, (noteReadError, notes) => {
        if (noteReadError) {
          logger.error('getNotesByQuery error', { noteReadError });
          return cb(noteReadError);
        }

        if (notes && notes.length > 0) {
          return cb(null, this.convertNoteDataForRead(notes));
        }
        // This is okay - will happen during an upsert
        logger.trace('getNotesByQuery nothing found', { query });
        return cb();
      });
    });
  }

  getNoteByQuery(query, cb) {
    this.getNotesByQuery(query, (notesReadError, notes) => {
      if (notesReadError || !notes || !notes.length) {
        return cb(notesReadError, notes);
      }
      if (notes.length > 1) {
        logger.error('Only expecting 1 note back in getNoteByQuery', { query, notes });
      }
      return cb(null, this.convertNoteDataForRead(notes[0]));
    });
  }

  getNoteById(id, cb) {
    const _id = new ObjectID(id);
    this.getNoteByQuery({ _id }, cb);
  }

  getNoteByImageId(imageId, cb) {
    const query = {
      images: { $elemMatch: { id: imageId } },
    };
    this.getNoteByQuery(query, cb);
  }

  getNotesByIds(ids, cb) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    this.getNotesByQuery(query, cb);
  }

  getNotesLatest(qty, cb) {
    // This method doesn't work with getNoteByQuery since we need .limit()
    // Calling Mongo directly from here, for now
    this.GetDb((err, db) => {
      db.collection('note').find().sort({ date: -1 }).limit(qty)
        .toArray((noteErr, notes) => {
          if (noteErr) return cb(noteErr);

          return this.getNotesWithPlants(notes, cb); // next step: match up with plant names
        });

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
    });
  }

  getNotesWithPlants(notesCopy, cb) {
    // Grab the plant ids off each note (can be more than 1 per note)
    const myPlantIds = notesCopy.reduce((acc, { plantIds }) => acc.concat(plantIds), []);

    this.getPlantsByIds(_.uniq(myPlantIds), null, (err, plants) => {
      if (err) {
        return cb(err);
      }

      const notes = notesCopy.map((note) => {
        const plantIds = note.plantIds.map(pId => pId.toString());
        return {
          ...note,
          plants: plants.filter(plant => plantIds.includes(plant._id)),
        };
      });

      return cb(null, notes);
    });
  }

  getNotesByPlantId(plantId, cb) {
    const query = { plantIds: new ObjectID(plantId) };
    this.getNotesByQuery(query, cb);
  }

  // Note U: updateNote

  updateNote(note, cb) {
    this.GetDb((err, db) => {
      if (!note.userId) {
        logger.error('userId must be specified as part of note when updating a note', { note });
        return cb('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      const query = _.pick(note, ['_id', 'userId']);
      const set = _.omit(note, ['_id']);
      return Update.updateOne(db, 'note', query, set, updateNoteError =>
        // results => {n:1, nModified:1, ok:1}
        cb(updateNoteError, this.convertNoteDataForRead(note)));
    });
  }

  addSizesToNoteImage(noteUpdate, cb) {
    this.GetDb((err, db) => {
      if (!noteUpdate.userId) {
        logger.error('userId must be specified as part of note when updating a note', { noteUpdate });
        return cb('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(noteUpdate);
      const query = _.pick(noteUpdate, ['_id', 'userId']);
      query.images = { $elemMatch: { id: noteUpdate.imageId } };
      const set = { $set: { 'images.$.sizes': noteUpdate.sizes } };
      logger.info('mongo.addSizesToNoteImage', { query, set });
      return Update.updateOne(db, 'note', query, set, cb);
    });
  }

  // Note UI: upsertNote

  upsertNote(note, cb) {
    const { _id } = note;
    this.getNoteById(_id, (getNoteByIdError, foundNote) => {
      if (getNoteByIdError) {
        // Already logged
        return cb(getNoteByIdError);
      }
      return foundNote
        ? this.updateNote(note, cb)
        : this.createNote(note, cb);
    });
  }

  // Note D: deleteNote

  deleteNote(_id, userId, cb) {
    this.GetDb((err, db) => {
      remove(db, 'note', {
        _id: new ObjectID(_id),
        userId: new ObjectID(userId),
      })
        .then(deletedCount => cb(null, deletedCount))
        .catch(error => cb(error));
    });
  }

  // End CRUD methods for Note collection

  // CRUD operations for Location collection

  // Location C: createLocation
  // eslint-disable-next-line class-methods-use-this
  convertLocationDataTypesForSaving(loc) {
    if (loc._id) {
      // eslint-disable-next-line no-param-reassign
      loc._id = new ObjectID(loc._id);
    }
    if (loc.createdBy) {
      // eslint-disable-next-line no-param-reassign
      loc.createdBy = new ObjectID(loc.createdBy);
    }
  }

  convertLocationDataForRead(loc) {
    if (!loc) {
      return loc;
    }
    if (_.isArray(loc)) {
      return loc.map(this.convertLocationDataForRead, this);
    }
    const convertedLocation = this.convertIdToString(loc);
    if (convertedLocation.createdBy) {
      convertedLocation.createdBy = convertedLocation.createdBy.toString();
    }
    return convertedLocation;
  }

  createLocation(loc, cb) {
    this.GetDb((err, db) => {
      if (!loc.members || !loc.createdBy) {
        const errMsg =
          'members and createdBy must be specified as part of location when creating a location';
        logger.error(errMsg, { loc });
        return cb(errMsg);
      }
      this.convertLocationDataTypesForSaving(loc);
      return Create.createOne(db, 'location', loc, (createOneError, createdLocation) => {
        logger.trace('createdLocation', { createdLocation });
        return cb(createOneError, this.convertLocationDataForRead(createdLocation));
      });
    });
  }

  // Location R: getLocationById

  getAllUsers(cb) {
    this.GetDb((err, db) => {
      const userQuery = {};
      const userFields = { _id: true, name: true, createdAt: true };
      const userOptions = {};

      read(db, 'user', userQuery, userFields, userOptions, (getUserError, users) => {
        if (getUserError) {
          return cb(getUserError, users);
        }
        // eslint-disable-next-line no-param-reassign
        users = this.convertIdToString(users);

        const locationQuery = {};
        const locationFields = { _id: true, members: true };
        const locationOptions = {};
        return read(db, 'location', locationQuery, locationFields, locationOptions, (locationReadError, locations) => {
          if (locationReadError) {
            return cb(null, users);
          }
          this.convertLocationDataForRead(locations);
          const usersWithlocationIds = getUsersWithLocations(users, locations);
          return cb(null, usersWithlocationIds);
        });
      });
    });
  }

  getLocationsByQuery(query, options, cb) {
    const { locationsOnly = false } = options;
    this.GetDb((err, db) => {
      const locationFields = {};
      const locationOptions = {};
      read(db, 'location', query, locationFields, locationOptions, (locationReadError, locationsData) => {
        if (locationReadError) {
          logger.error('getLocationsByQuery error', { locationReadError });
          return cb(locationReadError);
        }
        if (locationsOnly) {
          return cb(null, locationsData);
        }

        const locations = this.convertLocationDataForRead(locationsData);
        const plantQuery = {};
        const plantFields = { _id: true, locationId: true };
        const plantOptions = {};
        return read(db, 'plant', plantQuery, plantFields, plantOptions, (plantReadError, plants) => {
          if (plantReadError) {
            return cb(null, locations);
          }
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
          return cb(null, locationsWithPlantIds);
        });
      });
    });
  }

  getAllLocations(cb) {
    this.getLocationsByQuery({}, {}, cb);
  }

  getLocationById(id, cb) {
    const _id = new ObjectID(id);
    this.getLocationsByQuery({ _id }, {}, cb);
  }

  /**
   * Get a single location and don't augment it
   * @param {string} id - the location's id
   * @param {function} cb - callback for return value
   */
  getLocationOnlyById(id, cb) {
    const _id = new ObjectID(id);
    this.getLocationsByQuery({ _id }, { locationsOnly: true },
      (err, location = []) => cb(err, location && location[0]));
  }

  getLocationsByIds(ids, cb) {
    const query = {
      _id: { $in: ids.map(id => new ObjectID(id)) },
    };
    this.getLocationsByQuery(query, {}, cb);
  }

  /**
   * Gets all locations that the specified user manages or owns
   * Also gets all the users at each of those locations
   * @param {string} userId - the userId of the user
   * @param {function} cb - method to call with the results
   * @returns {undefined}
   */
  getLocationsByUserId(userId, cb) {
    // A location object looks like this:
    // { _id, createdBy, members: { id: role }, stations: {id: ...} title,
    //   loc: {type, coordinates: {}}}
    const query = { [`members.${userId}`]: { $exists: true } };
    this.getLocationsByQuery(query, {}, cb);
  }

  // Location U: updateLocation
  /**
   * Gets the user's role at the given location.
   * @param {string} locationId - location id
   * @param {string} userId - user id
   * @param {string[]} roles - roles that user needs to have
   * @param {function} cb - call with error and role
   */
  roleAtLocation(locationId, userId, roles, cb) {
    if (!constants.mongoIdRE.test(userId)) {
      const errMsg = 'roleAtLocation attempted with an invalid userId';
      logger.error(errMsg, { locationId, userId, roles });
      return cb(errMsg, false);
    }

    return this.getLocationOnlyById(locationId, (getLocationOnlyByIdError, location) => {
      if (getLocationOnlyByIdError) {
        const errMsg = 'getLocationOnlyByIdError in roleAtLocation';
        logger.error(errMsg, { getLocationOnlyByIdError, locationId, userId, roles });
        return cb(errMsg, false);
      }

      const role = location && location.members && location.members[userId];
      return cb(null, roles.includes(role));
    });
  }

  updateLocationById(location, loggedInUserId, cb) {
    this.GetDb((err, db) => {
      this.convertLocationDataTypesForSaving(location);
      // By creating a query that restricts by the location's _id and also where
      // the logged in user is the owner a non-owner can't update a location they
      // don't own.
      const updateQuery = {
        _id: new ObjectID(location._id),
        [`members.${loggedInUserId}`]: 'owner',
      };
      const set = _.omit(location, '_id');
      Update.updateOne(db, 'location', updateQuery, set, cb);
    });
  }

  // Location D: deleteLocation

  deleteLocation(_id, loggedInUserId, cb) {
    this.GetDb((err, db) => {
      // By creating a query the restricts by the location's _id and also where
      // the logged in user is the owner a non-owner can't delete a location they
      // don't own.
      const deleteQuery = {
        _id: new ObjectID(_id),
        [`members.${loggedInUserId}`]: 'owner',
      };
      remove(db, 'location', deleteQuery)
        .then(deletedCount => cb(null, deletedCount))
        .catch(error => cb(error));
    });
  }

  // End CRUD methods for Location collection

  /**
   * Wholesale replace a document in any collection. Uses the documents _id prop.
   * @param {string} collection - the collection being updated
   * @param {Object} doc - the document to replace
   * @param {Function} cb - the callback function
   */
  replaceDocument(collection, doc, cb) {
    this.GetDb((err, db) => {
      if (!doc._id) {
        const errMsg = 'Must have _id to do a wholesale update';
        logger.error(errMsg, { collection, doc });
        return cb(errMsg);
      }

      switch (collection) {
        case 'location':
          this.convertLocationDataTypesForSaving(doc);
          break;
        default: {
          const errMsg = `Collection type "${collection}" not implemented in updateWholesale yet`;
          logger.error(errMsg, { collection, doc });
          return cb(errMsg);
        }
      }

      return Update.replaceOne(db, collection, doc, cb);
    });
  }

  /**
   * Read the documents from a collection
   * @param {string} collection - the collection being read from
   * @param {Object} query - the filter to apply to the read
   * @param {Function} cb - the callback function
   */
  queryByCollection(collection, query, cb) {
    this.GetDb((err, db) => {
      const fields = {};
      const options = {};
      read(db, collection, query, fields, options, (readError, results) => {
        if (readError) {
          logger.error('queryByCollection error', { readError });
          return cb(readError);
        }
        return cb(null, results);
      });
    });
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

module.exports = new MongoDb();
