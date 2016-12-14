const _ = require('lodash');
const async = require('async');
const constants = require('../../../app/libs/constants');
const read = require('./read');
const Create = require('./create');
const Update = require('./update');
const remove = require('./delete');
const mongodb = require('mongodb');
const utils = require('../../../app/libs/utils');

const {ObjectID} = mongodb;

const mongoConnection = `mongodb://${process.env.PLANT_DB_URL || '127.0.0.1'}/${process.env.PLANT_DB_NAME || 'plant'}`;

const logger = require('../../logging/logger').create('mongo-index');

// This stores a cache of the user's location
const locationLocCache = {};

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
    if(this.db) {
      return cb(null, this.db);
    } else {
      logger.trace('mongoConnection', {mongoConnection});
      mongodb.MongoClient.connect(mongoConnection, (err, db) => {
        if(err) {
          logger.error(`Connection to ${mongoConnection} failed:`, {err});
          return cb(err);
        } else {
          logger.trace('DB successfully connected.');
          this.db = db;
          return cb(err, db);
        }
      });
    }
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
    if(_.isArray(obj)) {
      return obj.map(this.convertIdToString, this);
    } else {
      if(obj && obj._id) {
        obj._id = obj._id.toString();
      }
      return obj;
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
  findOrCreateUser(userDetails, cb) {
    // 1. Get the DB
    const getDb = (done) => {
      this.GetDb((err, db) => {
        return done(err, {db});
      });
    };

    // 2. data.db is now set
    //    Set the query to find the user
    const setQuery = (data, done) => {
      if(!_.get(userDetails, 'facebook.id') && !_.get(userDetails, 'google.id')) {
        return done(new Error('No facebook.id or google.id:', JSON.stringify(userDetails)));
      }

      data.query = userDetails.facebook
        ? {
          'facebook.id': userDetails.facebook.id
        }
        : {
          'google.id': userDetails.google.id
        };

      done(null, data);
    };

    // 3. Find the user by OAuth provider id
    const getUser = (data, done) => {
      read(data.db, 'user', data.query, {}, {}, (readError, user) => {
        if(readError) {
          logger.error('user readError:', {readError});
          return done(readError);
        }

        if(user && user.length !== 1) {
          logger.error(`Unexpected user.length: ${user.length}`, {user});
        }

        if(user && user.length > 0) {
          data.user = this.convertIdToString(user[0]);
        }

        return done(null, data);
      });
    };

    // 4. If user not found then try find by email
    const getUserByEmail = (data, done) => {
      if(data.user) {
        return done(null, data);
      }
      if(userDetails.email) {
        data.query = {
          email: userDetails.email
        };
        return getUser(data, done);
      } else {
        return done(null, data);
      }
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
      if(!data.user) {
        return done(null, data);
      }
      _.merge(data.user, userDetails);
      const userData = _.omit(data.user, ['_id']);
      const query = {_id: new ObjectID(data.user._id)};
      Update.updateOne(data.db, 'user', query, userData, (err, result) => {
        if(!result || result.n === 0) {
          logger.error('User not updated', {data, result, query});
          return done(`update did not update any docs with query: ${JSON.stringify(query)}`);
        }
        if(err) {
          logger.error('Error in user update', {data}, {err}, {result});
        }
        return done(err, data);
      });
    };

    // 6. Create user
    const createUser = (data, done) => {
      if(data.user) {
        return done(null, data.user);
      }
      Create.createOne(data.db, 'user', userDetails, (createOneError, createdUser) => {
        return done(createOneError, this.convertIdToString(createdUser));
      });
    };

    async.waterfall([
      getDb,
      setQuery,
      getUser,
      getUserByEmail,
      updateUser,
      createUser
    ], cb);
  }

  // User R: Read user
  getUserByQuery(query, cb) {
    this.GetDb((err, db) => {
      const fields = {_id: true, name: true, createdAt: true};
      const options = {};

      read(db, 'user', query, fields, options, (readUserError, users) => {
        if(readUserError) {
          logger.error('getUserByQuery readUserError:', {readUserError, query});
          return cb(readUserError);
        } else {
          return cb(null, users);
        }
      });
    });
  }

  getUserById(userId, cb) {
    if(!constants.mongoIdRE.test(userId)) {
      return cb();
    }
    const userQuery = {
      _id: new ObjectID(userId)
    };

    this.getUserByQuery(userQuery, (getUserByQueryError, users) => {
      if(getUserByQueryError) {
        return cb(getUserByQueryError);
      } else if(users) {
        if(users.length !== 1) {
          logger.error(`Unexpected users.length: ${users.length}`, {users});
        }

        const plantQuery = {userId: users[0]._id};
        this.GetDb((err, db) => {
          read(db, 'plant', plantQuery, {_id: true}, {}, (plantReadError, plants) => {
            // Convert Mongo ObjectIds to strings
            const user = this.convertIdToString(users[0]);
            user.plantIds = (plants || []).map(plant => plant._id.toString());
            return cb(null, _.pick(user, ['_id', 'name', 'createdAt', 'plantIds']));
          });
        });
      } else {
        logger.warn('No user found in query', {userQuery});
        return cb();
      }
    });
  }

  getAllUsers(cb) {
    this.GetDb((err, db) => {
      let userQuery = {};
      const userFields = {_id: true, name: true, createdAt: true};
      const userOptions = {};

      read(db, 'user', userQuery, userFields, userOptions, (getUserError, users) => {
        if(getUserError) {
          return cb(getUserError, users);
        }

        const plantQuery = {};
        const plantFields = {_id: true, userId: true};
        const plantOptions = {};
        read(db, 'plant', plantQuery, plantFields, plantOptions, (plantReadError, plants) => {
          if(plantReadError) {
            return cb(null, users);
          }
          const stringPlants = (plants || []).map(plant => {
            return {
              _id: plant._id.toString(),
              userId: plant.userId.toString()
            };
          });
          const usersWithPlantIds = (users || []).map(user => {
            user.plantIds = stringPlants.filter(plant => plant.userId === user._id.toString()).map(p => p._id);
            return user;
          });
          return cb(null, usersWithPlantIds);
        });
      });
    });
  }

  // User U: Update user

  _updateUser(user, cb) {
    const _id = typeof user._id === 'string' ? new ObjectID(user._id) : user._id;
    this.GetDb((err, db) => {
      const query = { _id };
      const set = _.omit(user, ['_id']);
      Update.updateOne(db, 'user', query, set, (updateUserError) => {
        return cb(updateUserError, user);
      });
    });
  }

  // User D: No Delete function for User yet
  // End CRUD methods for collection "user"

  // CRUD operations for Plant collection

  // Plant C: cratePlant

  convertPlantDataTypesForSaving(plant) {
    if(plant._id) {
      plant._id = new ObjectID(plant._id);
    }
    plant.userId = new ObjectID(plant.userId);
    plant.locationId = new ObjectID(plant.locationId);
    const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
    dateFields.forEach(dateField => {
      if(plant[dateField]) {
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
  rebasePlant(plant, loc) {
    plant.loc.coordinates[0] = loc.coordinates[0] - plant.loc.coordinates[0];
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
    if(locationLocCache[plant.locationId]) {
      return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
    } else {
      this.GetDb((err, db) => {
        const locationQuery = {
          _id: new ObjectID(plant.locationId)
        };
        const fields = {};
        const options = {};

        read(db, 'location', locationQuery, fields, options, (readLocationError, locations) => {
          // Might have been cached by a parallel async call so check again
          if(locationLocCache[plant.locationId]) {
            return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
          }

          if(readLocationError) {
            logger.error('rebasePlantByLoc readLocationError:', {readLocationError, locationQuery});
            delete plant.loc;
            return cb(readLocationError, plant);
          } else {
            const locat = locations[0];
            if(locat.loc) {
              locationLocCache[plant.locationId] = locat.loc;
              return cb(null, this.rebasePlant(plant, locationLocCache[plant.locationId]));
            } else {
              locationLocCache[plant.locationId] = plant.loc;
              locat.loc = plant.loc;

              Update.updateOne(db, 'location', locationQuery, locat, (updateLocationError) => {
                return cb(updateLocationError, this.rebasePlant(plant, locationLocCache[plant.locationId]));
              });
            }
          }
        });
      });
    }
  }

  convertPlantDataForRead(plant, loggedInUserId, cb) {
    if(!plant) {
      return plant;
    }
    if(_.isArray(plant)) {
      const _this = this;
      async.map(plant, (p, done) => {
        _this.convertPlantDataForRead(p, loggedInUserId, done);
      }, cb);
    } else {
      const convertedPlant = this.convertIdToString(plant);
      if(convertedPlant.userId) {
        convertedPlant.userId = convertedPlant.userId.toString();
      }

      // Only return the geoLocation of the plant if it's the logged in user requesting their own plant
      if(convertedPlant.loc && convertedPlant.userId !== loggedInUserId) {
        return this.rebasePlantByLoc(convertedPlant, cb);
      } else {
        return cb(null, convertedPlant);
      }
    }
  }

  createPlant(plant, loggedInUserId, cb) {
    this.GetDb((err, db) => {
      if(!plant.userId) {
        logger.warn('Missing plant.userId', {plant});
        return cb('userId must be specified as part of plant when creating a plant');
      }
      this.convertPlantDataTypesForSaving(plant);
      Create.createOne(db, 'plant', plant, (createOnePlantErr, createdPlant) => {
        if(createOnePlantErr) {
          logger.error('createOne plant error', {createOnePlantErr});
          return cb(createOnePlantErr);
        }
        this.convertPlantDataForRead(createdPlant, loggedInUserId, cb);
      });
    });
  }

  /**
   * Gets the plant document from the plant collection and sets the
   * notes property of this document to an array of notes queried
   * from the notes collection.
   * @param {string} plantId - mongoId of plant to fetch
   * @param {string} loggedInUserId - the id of the user currently logged in or falsey if anonymous request
   * @param {Function} cb - callback for result
   * @returns {undefined}
   */
  getPlantById(plantId, loggedInUserId, cb) {
    if(!constants.mongoIdRE.test(plantId)) {
      return cb();
    }
    this.GetDb((err, db) => {
      let query = {
        _id: new ObjectID(plantId)
      };
      const fields = {};
      const options = {};

      read(db, 'plant', query, fields, options, (readError, plants) => {
        if(readError) {
          logger.error('plant readError:', {readError});
          return cb(readError);
        } else if(plants) {
          if(plants.length !== 1) {
            logger.error(`Unexpected plant.length: ${plants.length}`, {plants});
          }
          // {_id: {$in: splitNotes.singlePlantNotes}}
          const noteQuery = {plantIds: plants[0]._id};
          const noteFields = {_id: true};
          const noteOptions = { sort: [['date', 'asc']] };
          read(db, 'note', noteQuery, noteFields, noteOptions, (noteReadError, notes) => {
            if(noteReadError) {
              logger.error('note noteReadError', {noteReadError});
              return cb(noteReadError);
            }
            // Convert Mongo ObjectIds to strings
            this.convertPlantDataForRead(plants[0], loggedInUserId, (convertPlantDataForReadError, plant) => {
              plant.notes = (notes || []).map(note => note._id.toString());
              return cb(readError, plant);
            });
          });
        } else {
          // readError and plant are both falsey
          logger.warn('No plant found in query', {query});
          return cb();
        }
      });
    });
  }

  /**
   * Gets all the plants belonging to a user. Does not populate the notes field.
   * @param {string} userId - the userId to query against the plant collection.
   * @param {string} loggedInUserId - the id of the user currently logged in or falsey if anonymous request
   * @param {Function} cb - callback for result
   * @return {undefined}
   */
  getPlantsByUserId(userId, loggedInUserId, cb) {
    if(!constants.mongoIdRE.test(userId)) {
      return cb();
    }
    this.GetDb((err, db) => {
      userId = new ObjectID(userId);
      const fields = {};
      const options = {};

      read(db, 'user', {_id: userId}, fields, options, (readUserError, user) => {
        if(readUserError) {
          logger.error('getPlantsByUserId read user error', {readUserError});
          return cb(readUserError);
        }
        if(user && user.length === 1) {
          const plantQuery = {userId};
          const plantFields = {};
          const plantOptions = { sort: [['title', 'asc']] };
          read(db, 'plant', plantQuery, plantFields, plantOptions, (readPlantError, plants) => {
            if(readPlantError) {
              logger.error('getPlantsByUserId read plants by userId error:', {readPlantError});
              return cb(readPlantError);
            } else {
              return this.convertPlantDataForRead(plants || [], loggedInUserId, cb);
            }
          });
        } else {
          logger.error(`getPlantsByUserId No user found for userId ${userId.toString()}`);
          return cb();
        }
      });
    });
  }

  getPlantsByIds(ids, loggedInUserId, cb) {
    const plantQuery = {
      _id: {$in: ids.map(id => new ObjectID(id))}
    };
    const plantFields = {};
    const plantOptions = { sort: [['title', 'asc']] };
    this.GetDb((err, db) => {
      read(db, 'plant', plantQuery, plantFields, plantOptions, (readPlantError, plants) => {
        if(readPlantError) {
          logger.error('getPlantsByIds read plants by ids error:', {readPlantError});
          return cb(readPlantError);
        } else {
          return this.convertPlantDataForRead(plants || [], loggedInUserId, cb);
        }
      });
    });
  }

  // Plant U: updatePlant

  updatePlant(plant, loggedInUserId, cb) {
    if(!plant._id || !plant.userId) {
      logger.error(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
      return cb(`Must supply _id (${plant._id}) and userId (${plant.userId}) when updating a plant`);
    }
    this.convertPlantDataTypesForSaving(plant);
    this.GetDb((err, db) => {
      const query = _.pick(plant, ['_id', 'userId']);
      const set = _.omit(plant, ['_id']);
      Update.updateOne(db, 'plant', query, set, (updatePlantError) => {
        this.convertPlantDataForRead(plant, loggedInUserId, (convertPlantDataForReadErr, convertedPlant) => {
          return cb(updatePlantError, convertedPlant);
        });
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
      _id = new ObjectID(_id);
      userId = new ObjectID(userId);

      function getNotes(done) {
        const noteQuery = {plantIds: _id, userId};
        const noteFields = {};
        const noteOptions = { sort: [['date', 'asc']] };

        read(db, 'note', noteQuery, noteFields, noteOptions, (getNotesError, notesForPlant) => {
          if(getNotesError) {
            return done(getNotesError);
          } else {
            // Split the notesForPlant array in 2:
            // 1. Those that only reference this plant - need to delete these
            // 2. Those that reference multiple plants - need to update these and remove this plant's reference
            const splitNotes = (notesForPlant || []).reduce((acc, note) => {
              if(note.plantIds.length === 1) {
                acc.singlePlantNotes.push(note._id);
              } else {
                acc.multiplePlantNotes.push(note);
              }
              return acc;
            }, {singlePlantNotes: [], multiplePlantNotes: []});
            return done(null, splitNotes);
          }
        });
      }

      function deleteNotes(splitNotes, done) {
        // TODO: Confirm that this does a bulk delete
        // Need tests where noteIds end up being array of:
        // 0, 1, 2 in length
        if(splitNotes.singlePlantNotes.length > 0) {
          const deleteQuery = {_id: {$in: splitNotes.singlePlantNotes}};
          remove(db, 'note', deleteQuery, (removeNoteErr /*, removeNoteResults*/) => {
            if(removeNoteErr) {
              logger.error('deleteNotes removeNoteErr', {removeNoteErr});
            }
            // TODO: Add a check that the number of documents removed in removeNoteResults is same as length
            // of array passed to _id.
            // Don't need the singlePlantNotes anymore so don't need to pass them on.
            done(removeNoteErr, splitNotes.multiplePlantNotes);
          });
        } else {
          done(null, splitNotes.multiplePlantNotes);
        }
      }

      function updateNotes(multiplePlantNotes, done) {
        if(multiplePlantNotes.length > 0) {
          const updatedNotes = multiplePlantNotes.map(note => {
            return Object.assign({},
              note,
              {plantIds: note.plantIds.filter(plantId => plantId !== _id)}
            );
          });
          async.each(updatedNotes, (updateNote, eachDone) => {
            const noteQuery = {_id: updateNote._id};
            const set = _.omit(updateNote, ['_id']);
            Update.updateOne(db, 'note', noteQuery, set, eachDone);
          }, (eachDoneErr) => {
            if(eachDoneErr) {
              logger.error('updateNotes error', {eachDoneErr});
            }
            done(eachDoneErr);
          });
        } else {
          return done();
        }
      }

      function deletePlant(done) {
        remove(db, 'plant', {_id, userId}, done);
      }

      async.waterfall([getNotes, deleteNotes, updateNotes, deletePlant], (waterfallError, deleteResult) => {
        if(waterfallError) {
          logger.error('delete plant finished with error', {waterfallError});
        }
        cb(waterfallError, deleteResult);
      });

    });
  }

  // Only used for testing - so far - needs to delete notes as well if to be used in prod
  deleteAllPlantsByUserId(userId, cb) {
    this.GetDb((err, db) => {
      userId = new ObjectID(userId);
      remove(db, 'plant', {userId}, cb);
    });
  }

  // End CRUD methods for Plant collection

  // CRUD operations for Note collection

  // Note C: createNote

  convertNoteDataTypesForSaving(note) {
    if(note._id) {
      note._id = new ObjectID(note._id);
    }
    if(note.date) {
      note.date = utils.dateToInt(note.date);
    }
    if(note.plantIds && note.plantIds.length > 0) {
      note.plantIds = note.plantIds.map(plantId => new ObjectID(plantId));
    }
    note.userId = new ObjectID(note.userId);
  }

  convertNoteDataForRead(note) {
    if(!note) {
      return note;
    }
    if(_.isArray(note)) {
      return note.map(this.convertNoteDataForRead, this);
    } else {
      const convertedNote = this.convertIdToString(note);
      if(convertedNote.userId) {
        convertedNote.userId = convertedNote.userId.toString();
      } else {
        logger.error('In convertNoteDataForRead() there is no userId', {note, convertedNote});
      }
      if(convertedNote.plantIds && convertedNote.plantIds.length) {
        convertedNote.plantIds = (convertedNote.plantIds || []).map(plantId => plantId.toString());
      }
      return convertedNote;
    }
  }

  createNote(note, cb) {
    this.GetDb((err, db) => {
      if(!note.userId) {
        logger.error('userId must be specified as part of note when creating a note', {note});
        return cb('userId must be specified as part of note when creating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      note.plantIds = note.plantIds || [];
      Create.createOne(db, 'note', note, (createOneError, createdNote) => {
        logger.trace('createdNote', {createdNote});
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
        if(noteReadError) {
          logger.error('getNotesByQuery error', {noteReadError});
          return cb(noteReadError);
        }

        if(notes && notes.length > 0) {
          return cb(null, this.convertNoteDataForRead(notes));
        } else {
          // This is okay - will happen during an upsert
          logger.trace('getNotesByQuery nothing found', {query});
          cb();
        }
      });
    });
  }

  getNoteByQuery(query, cb) {
    this.getNotesByQuery(query, (notesReadError, notes) => {
      if(notesReadError || !notes || !notes.length) {
        return cb(notesReadError, notes);
      }
      if(notes.length > 1) {
        logger.error('Only expecting 1 note back in getNoteByQuery', {query, notes});
      }
      return cb(null, this.convertNoteDataForRead(notes[0]));
    });
  }

  getNoteById(id, cb) {
    const _id = new ObjectID(id);
    this.getNoteByQuery({_id}, cb);
  }

  getNoteByImageId(imageId, cb) {
    const query = {
      images: { $elemMatch: { id: imageId } }
    };
    this.getNoteByQuery(query, cb);
  }

  getNotesByIds(ids, cb) {
    const query = {
      _id: {$in: ids.map(id => new ObjectID(id))}
    };
    this.getNotesByQuery(query, cb);
  }

  getNotesByPlantId(plantId, cb) {
    const query = {plantIds: new ObjectID(plantId)};
    this.getNotesByQuery(query, cb);
  }

  // Note U: updateNote

  updateNote(note, cb) {
    this.GetDb((err, db) => {
      if(!note.userId) {
        logger.error('userId must be specified as part of note when updating a note', {note});
        return cb('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(note);
      const query = _.pick(note, ['_id', 'userId']);
      const set = _.omit(note, ['_id']);
      Update.updateOne(db, 'note', query, set, (updateNoteError /*, results*/) => {
        // results => {n:1, nModified:1, ok:1}
        return cb(updateNoteError, this.convertNoteDataForRead(note));
      });
    });
  }

  addSizesToNoteImage(noteUpdate, cb) {
    this.GetDb((err, db) => {
      if(!noteUpdate.userId) {
        logger.error('userId must be specified as part of note when updating a note', {noteUpdate});
        return cb('userId must be specified as part of note when updating a note');
      }
      this.convertNoteDataTypesForSaving(noteUpdate);
      const query = _.pick(noteUpdate, ['_id', 'userId']);
      query.images = { $elemMatch: { id: noteUpdate.imageId } };
      const set = {$set: {'images.$.sizes': noteUpdate.sizes}};
      Update.updateOne(db, 'note', query, set, cb);
    });
  }

  // Note UI: upsertNote

  upsertNote(note, cb) {
    const {_id} = note;
    this.getNoteById(_id, (getNoteByIdError, foundNote) => {
      if(getNoteByIdError) {
        // Already logged
        return cb(getNoteByIdError);
      } else {
        if(foundNote) {
          this.updateNote(note, cb);
        } else {
          this.createNote(note, cb);
        }
      }
    });
  }

  // Note D: deleteNote

  deleteNote(_id, userId, cb) {
    this.GetDb((err, db) => {
      remove(db, 'note', {
        _id: new ObjectID(_id),
        userId: new ObjectID(userId)
      }, cb);
    });
  }

  // End CRUD methods for Note collection

  // CRUD operations for Location collection

  // Location C: createLocation
  convertLocationDataTypesForSaving(loc) {
    if(loc._id) {
      loc._id = new ObjectID(loc._id);
    }
    if(loc.userId) {
      loc.userId = new ObjectID(loc.userId);
    }
    if(loc.ownerIds && loc.ownerIds.length) {
      loc.ownerIds = loc.ownerIds.map(plantId => new ObjectID(plantId));
    }
    if(loc.managerIds && loc.managerIds.length) {
      loc.managerIds = loc.managerIds.map(plantId => new ObjectID(plantId));
    }
  }

  convertLocationDataForRead(loc) {
    if(!loc) {
      return loc;
    }
    if(_.isArray(loc)) {
      return loc.map(this.convertLocationDataForRead, this);
    } else {
      const convertedLocation = this.convertIdToString(loc);
      if(convertedLocation.ownerIds && convertedLocation.ownerIds.length) {
        convertedLocation.ownerIds = convertedLocation.ownerIds.map(ownerId => ownerId.toString());
      }
      if(convertedLocation.managerIds && convertedLocation.managerIds.length) {
        convertedLocation.managerIds = convertedLocation.managerIds.map(managerId => managerId.toString());
      }
      if(convertedLocation.userId) {
        convertedLocation.userId = convertedLocation.userId.toString();
      }
      return convertedLocation;
    }
  }

  createLocation(loc, cb) {
    this.GetDb((err, db) => {
      if(!loc.ownerIds || !loc.userId) {
        const errMsg = 'ownerIds and userId must be specified as part of location when creating a location';
        logger.error(errMsg, {loc});
        return cb(errMsg);
      }
      this.convertLocationDataTypesForSaving(loc);
      Create.createOne(db, 'location', loc, (createOneError, createdLocation) => {
        logger.trace('createdLocation', {createdLocation});
        return cb(createOneError, this.convertLocationDataForRead(createdLocation));
      });
    });
  }

  // Location R: getLocationById

  getLocationsByQuery(query, cb) {
    this.GetDb((err, db) => {
      const locationFields = {};
      const locationOptions = {};
      read(db, 'location', query, locationFields, locationOptions, (locationReadError, locations) => {
        if(locationReadError) {
          logger.error('getLocationsByQuery error', {locationReadError});
          return cb(locationReadError);
        }

        if(locations && locations.length) {
          return cb(null, this.convertLocationDataForRead(locations));
        } else {
          // This is okay - will happen during an upsert
          logger.trace('getLocationsByQuery nothing found', {query});
          cb();
        }
      });
    });
  }

  getLocationById(id, cb) {
    const _id = new ObjectID(id);
    this.getLocationsByQuery({_id}, cb);
  }

  getLocationsByIds(ids, cb) {
    const query = {
      _id: {$in: ids.map(id => new ObjectID(id))}
    };
    this.getLocationsByQuery(query, cb);
  }

  /**
   * Get a list of locations created by the specified user.
   * @param {string} userId - the userId of the user that created the location
   * @param {function} cb - method to call with the results
   * @returns {undefined}
   */
  getLocationsByUserId(userId, cb) {
    const query = {userId: new ObjectID(userId)};
    this.getLocationsByQuery(query, cb);
  }

  /**
   * Gets all locations that the specified user manages or owns
   * @param {string} userId - the userId of the user
   * @param {function} cb - method to call with the results
   * @returns {undefined}
   */
  getLocationsByManagerOwnerId(userId, cb) {
    const query = {
      $or: [
        {managerIds: new ObjectID(userId)},
        {ownerIds: new ObjectID(userId)}
      ]
    };
    this.getLocationsByQuery(query, cb);
  }

  // Location U: updateLocation

  updateLocationById(loc, cb) {
    this.GetDb((err, db) => {
      if(!loc.userId) {
        const errMsg = 'userId must be specified as part of location when updating a location';
        logger.error(errMsg, {loc});
        return cb(errMsg);
      }
      this.convertLocationDataTypesForSaving(loc);
      const query = _.pick(loc, ['_id']);
      // The userId is the id of the user doing the update which needs to be an owner.
      query.managerIds = loc.userId;
      // Remove the userId so that the location creator remains the userId of this document
      const set = _.omit(loc, ['_id', 'userId']);
      Update.updateOne(db, 'location', query, set, (updateLocationError /*, results*/) => {
        // results => {n:1, nModified:1, ok:1}
        return cb(updateLocationError, this.convertLocationDataForRead(loc));
      });
    });
  }

  // Location D: deleteLocation

  deleteLocation(_id, userId, cb) {
    this.GetDb((err, db) => {
      remove(db, 'location', {
        _id: new ObjectID(_id),
        ownerIds: new ObjectID(userId)
      }, cb);
    });
  }

  // End CRUD methods for Location collection


  // Temporary function for setting the location value in the plant collection
  _setLocation(userId, locationId, cb) {
    userId = typeof userId === 'string' ? new ObjectID(userId) : userId;
    locationId = typeof locationId === 'string' ? new ObjectID(locationId) : locationId;
    this.GetDb((err, db) => {
      const query = { userId };
      const set = {$set: {locationId} };
      Update.updateMany(db, 'plant', query, set, (updateLocationError, results) => {
        // results => {n:1, nModified:1, ok:1}
        return cb(updateLocationError, results);
      });
    });
  }

  _getAllUsersOnly(cb) {
    this.GetDb((err, db) => {
      read(db, 'user', {}, {}, {}, cb);
    });
  }
};

module.exports = new MongoDb();
