// Get all the data from the DB for a single plant to be able
// to render it on the server

const db = require('./mongo')();

/**
 * getNotes
 * @param {string} plantId
 * @param {Logger} logger
 * @returns {Promise<BizNoteMap>}
 */
async function getNotes(plantId, logger) {
  const retrievedNotes = await db.getNotesByPlantId(plantId, logger);

  const bizNoteMap = /** @type {BizNoteMap} */ ({});
  if (!retrievedNotes || !retrievedNotes.length) {
    return bizNoteMap;
  }

  return retrievedNotes.reduce(
    /**
     * @param {BizNoteMap} acc
     */
    (acc, note) => {
      acc[note._id] = note;
      return acc;
    }, bizNoteMap);
}

/**
 * getPlants
 * @param {BizUser=} loggedInUser
 * @param {string} plantId
 * @param {Logger} logger
 * @returns {Promise} - TODO: Work out how to return Promise<<BizPlantMap>
 */
async function getPlants(loggedInUser, plantId, logger) {
  const loggedInUserId = loggedInUser && loggedInUser._id;
  const retrievedPlant = await db.getPlantById(plantId, loggedInUserId, logger);

  const bizPlantMap = /** @type {BizPlantMap} */ ({});
  if (!retrievedPlant) {
    return bizPlantMap;
  }

  return /** @type {BizPlantMap} */ ({
    [retrievedPlant._id]: {
      ...retrievedPlant,
      notesRequested: true,
    },
  });
}

/**
 * singlePlant
 * @param {BizUser=} loggedInUser
 * @param {string} plantId
 * @param {string} noteId
 * @param {Logger} logger
 * @returns {Promise}
 */
const singlePlant = async (loggedInUser, plantId, noteId, logger) => {
  const promises = [
    db.getAllLocations(logger),
    getNotes(plantId, logger),
    getPlants(loggedInUser, plantId, logger),
    db.getAllUsers(logger),
  ];

  const results = await Promise.all(promises);

  /** @type {ReadonlyArray<Readonly<BizLocation>>} */
  const locations = results[0];
  /** @type {BizNoteMap} */
  const notes = results[1];
  /** @type {BizPlantMap} */
  const plants = results[2];
  /** @type {ReadonlyArray<Readonly<BizLocation>>} */
  const users = results[3];

  // If there's a noteId (there should be) then we need to tag the images in that noteId
  // as visible.
  const note = noteId && notes && notes[noteId];
  if (note) {
    notes[noteId] = { ...note, showImages: true };
  }

  return {
    interim: {},
    locations,
    notes,
    plants,
    user: loggedInUser || {},
    users,
  };
};

module.exports = singlePlant;

/*
Load:

Users
Locations
Plant
Notes

Final state:

interim: {}
locations: { id1: {}, id2: {}, ...}
notes: { id1: {}, id2: {}, ...}
plants: { id1: {}}
user: {} - if logged in
users: { id1: {}, id2: {}, ...}

*/
