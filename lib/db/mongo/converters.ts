import { ObjectID } from 'mongodb';
import utils from '../../../app/libs/utils';

export const convertPlantDataTypesForSaving = (
  plantIn: Readonly<BizPlant> | Readonly<UiPlantsValue>):
  Readonly<DbPlant> => {
  const plant: DbPlant = plantIn as unknown as DbPlant;
  if (plant._id) {
    plant._id = new ObjectID(plant._id);
  }
  plant.userId = new ObjectID(plant.userId);
  plant.locationId = new ObjectID(plant.locationId);

  if (plant.plantedDate) {
    plant.plantedDate = utils.dateToInt(plant.plantedDate);
  }
  if (plant.purchasedDate) {
    plant.purchasedDate = utils.dateToInt(plant.purchasedDate);
  }
  if (plant.terminatedDate) {
    plant.terminatedDate = utils.dateToInt(plant.terminatedDate);
  }

  return plant;
};
