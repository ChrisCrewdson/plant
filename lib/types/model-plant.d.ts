declare type TerminatedReason =
'culled' |
'died' |
'transferred';

interface BasePlant {
  botanicalName?: string;
  loc?: Geo;
  plantedDate?: number; // YYYYMMDD
  price?: number;
  purchaseDate?: number; // YYYYMMDD
  terminatedReason?: TerminatedReason;
  title: string;
}

// There are 3 data models for each collection:
// 1. Db<Collection> - Represents what is in the database
// 2. Biz<Collection> - What is passed around on the server
// 3. Ui<Collection> - What is passed around on the client

interface DbPlant extends BasePlant {
  _id: import('mongodb').ObjectID;
  locationId: import('mongodb').ObjectID;
  userId: import('mongodb').ObjectID;
}

interface BizPlant extends BasePlant {
  _id: string;
  locationId: string;
  userId: string;
  /**
   * Used by UI to signal if the notes for the plant have been requested
   * from the server.
   */
  notesRequested?: boolean;
  plantedOn?: number;
}

interface UiPlantsValue extends BasePlant {
  _id: string;
  notes: UiPlantsNotes[];
  locationId: string;
}

interface BizPlantMap {
  [mongoId: string]: BizPlant;
}  

interface UiPlantsNotes {

}  

interface UiPlants {
  [mongoId: string]: UiPlantsValue;
}
