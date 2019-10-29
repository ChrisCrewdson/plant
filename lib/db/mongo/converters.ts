import { ObjectID } from 'mongodb';
import { produce } from 'immer';
import utils from '../../../app/libs/utils';

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
  const {
    _id, date, plantIds, userId,
  } = noteParam;
  if (!userId) {
    throw new Error('userId is missing in convertNoteDataTypesForSaving');
  }

  const note: DbNote = noteParam as unknown as DbNote;

  if (_id) {
    note._id = new ObjectID(_id);
  }
  if (date) {
    note.date = utils.dateToInt(date);
  }
  if (plantIds && plantIds.length > 0) {
    note.plantIds = plantIds.map((plantId) => new ObjectID(plantId));
  }
  note.userId = new ObjectID(userId);
  return note;
};

export const convertNoteDataForRead = (note: Readonly<DbNote>): Readonly<BizNote> => {
  const { _id, userId, plantIds } = note;
  if (!userId) {
    throw new Error('No userId in convertNoteDataForRead');
  }
  const convertedNote = note as unknown as BizNote;

  if (_id) {
    convertedNote._id = _id.toString();
  }
  convertedNote.userId = userId.toString();
  if (plantIds && plantIds.length) {
    convertedNote.plantIds = (plantIds || []).map((plantId) => plantId.toString());
  }
  return convertedNote;
};

export const convertNotesDataForRead = (note: ReadonlyArray<DbNote>): ReadonlyArray<BizNote> => {
  if (!note || !note.length) {
    return [];
  }
  return note.map((n) => convertNoteDataForRead(n));
};
