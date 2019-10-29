import { ObjectID } from 'mongodb';
import { produce } from 'immer';
import Logger from 'lalog';
import utils from '../../../app/libs/utils';

const moduleName = 'lib/db/mongo/converters';

export const convertPlantDataTypesForSaving = (
  plantIn: Readonly<BizPlant> | Readonly<UiPlantsValue>):
  Readonly<DbPlant> => {
  const {
    userId, locationId, _id, plantedDate, purchasedDate, terminatedDate,
  } = plantIn;

  if (!userId) {
    throw new Error('Missing userId in convertPlantDataTypesForSaving');
  }
  if (!locationId) {
    throw new Error('Missing locationId in convertPlantDataTypesForSaving');
  }

  const plant: DbPlant = plantIn as unknown as DbPlant;
  return produce(plant, (draft) => {
    if (_id) {
      draft._id = new ObjectID(_id);
    }
    draft.userId = new ObjectID(userId);
    draft.locationId = new ObjectID(locationId);

    if (plantedDate) {
      draft.plantedDate = utils.dateToInt(plantedDate);
    }
    if (purchasedDate) {
      draft.purchasedDate = utils.dateToInt(purchasedDate);
    }
    if (terminatedDate) {
      draft.terminatedDate = utils.dateToInt(terminatedDate);
    }
  });
};

export const convertNoteDataTypesForSaving = (
  noteParam: Readonly<BizNote> | Readonly<BizNoteNew>): Readonly<DbNote> => {
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
};

export const convertNoteDataForRead = (note: Readonly<DbNote>,
  logger: Logger): Readonly<BizNote> => {
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
};

export const convertNotesDataForRead = (note: ReadonlyArray<DbNote>,
  logger: Logger): ReadonlyArray<BizNote> => {
  if (!note || !note.length) {
    return [];
  }
  return note.map((n) => convertNoteDataForRead(n, logger));
};
