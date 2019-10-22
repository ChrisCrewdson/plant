import Logger from 'lalog';
import { getDbInstance } from './mongo';

// Get all the data from the DB for a single plant to be able
// to render it on the server

const db = getDbInstance();

async function getNotes(plantId: string, logger: Logger): Promise<BizNoteMap> {
  const retrievedNotes: BizNote[]|undefined = await db.getNotesByPlantId(plantId, logger);

  const bizNoteMap: BizNoteMap = {};
  if (!retrievedNotes || !retrievedNotes.length) {
    return bizNoteMap;
  }

  return retrievedNotes.reduce(
    (acc: BizNoteMap, note) => {
      acc[note._id] = note;
      return acc;
    }, bizNoteMap);
}

/**
 * @returns - TODO: Work out how to return Promise<<BizPlantMap>
 */
async function getPlants(loggedInUser: BizUser | undefined, plantId: string, logger: Logger):
 Promise<any> {
  const loggedInUserId = loggedInUser && loggedInUser._id;
  const retrievedPlant = await db.getPlantById(plantId, loggedInUserId, logger);

  const bizPlantMap: BizPlantMap = {};
  if (!retrievedPlant) {
    return bizPlantMap;
  }

  return {
    [retrievedPlant._id]: {
      ...retrievedPlant,
      notesRequested: true,
    },
  }; // as BizMapPlant;
}

export const singlePlant = async (loggedInUser: BizUser | undefined,
  plantId: string, noteId: string, logger: Logger): Promise<any> => {
  const promises = [
    db.getAllLocations(logger),
    getNotes(plantId, logger),
    getPlants(loggedInUser, plantId, logger),
    db.getAllUsers(logger),
  ];

  const results = await Promise.all(promises);

  const locations: ReadonlyArray<Readonly<BizLocation>> = results[0];
  const notes: BizNoteMap = results[1];
  const plants: BizPlantMap = results[2];
  const users: ReadonlyArray<Readonly<BizLocation>> = results[3];

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
