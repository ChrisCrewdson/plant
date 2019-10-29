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
