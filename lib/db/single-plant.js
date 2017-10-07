// Get all the data from the DB for a single plant to be able
// to render it on the server

const db = require('./mongo');

async function getNotes(plantId) {
  const retrievedNotes = await db.getNotesByPlantId(plantId);
  if (retrievedNotes && retrievedNotes.length) {
    const reducedNotes = retrievedNotes.reduce((acc, note) => {
      acc[note._id] = note;
      return acc;
    }, {});
    return reducedNotes;
  }
  return {};
}

async function getPlants(loggedInUser, plantId) {
  const loggedInUserId = loggedInUser && loggedInUser._id;
  const retrievedPlant = await db.getPlantById(plantId, loggedInUserId);
  if (retrievedPlant) {
    retrievedPlant.notesRequested = true;
    return {
      [retrievedPlant._id]: retrievedPlant,
    };
  }
  return {};
}

module.exports = (loggedInUser, plantId) => {
  const promises = [
    db.getAllLocations(),
    getNotes(plantId),
    getPlants(loggedInUser, plantId),
    db.getAllUsers(),
  ];
  return Promise.all(promises).then((results) => {
    const [
      locations,
      notes,
      plants,
      users,
    ] = results;
    return {
      interim: {},
      locations,
      notes,
      plants,
      user: loggedInUser || {},
      users,
    };
  }).catch((error) => {
    throw error;
  });
};

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
