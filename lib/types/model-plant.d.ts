// There are 3 data models for each collection:
// 1. Db<Collection> - Represents what is in the database
// 2. Biz<Collection> - What is passed around on the server
// 3. Ui<Collection> - What is passed around on the client

declare type TerminatedReason =
'culled' |
'died' |
'transferred';

declare type PlantDateFieldNames =
  'plantedDate' |
  'purchasedDate' |
  'terminatedDate';

interface DbPlant {
  _id: import('mongodb').ObjectID;
  locationId: import('mongodb').ObjectID;
  userId: import('mongodb').ObjectID;
  botanicalName?: string;
  commonName?: string;
  description?: string;
  loc?: Geo;
  plantedDate?: number; // YYYYMMDD
  /**
   * TODO: In the UI this will be a string while editing but in DB will be a number
   *  value or be missing.
   *       So DbPlant cannot inherit this without changing this type to a number
   * Now that typing is done we should be able to make this a number for the DB and
   *  then fix in one of the extending interfaces.
   */
  price?: number|string;
  purchasedDate?: number; // YYYYMMDD
  terminatedDate?: number;
  terminatedDescription?: string;
  terminatedReason?: TerminatedReason;
  title: string;
}

interface BizPlant extends Omit<DbPlant, '_id' | 'locationId' | 'userId'> {
  _id: string;
  locationId: string;
  /**
   * Used by UI to signal if the notes for the plant have been requested
   * from the server.
   */
  notesRequested?: boolean;
  plantedOn?: number; // TODO: plantedOn seems to be a bug - should this be plantedDate?
  /**
   * An array of MongoId strings representing notes
   */
  notes?: string[];
  userId: string;
}

interface UiPlantsValue extends Omit<BizPlant, '_id' | 'notes' | 'userId'> {
  _id?: string;
  errors?: Record<string, string>;
  isNew?: boolean;
  isTerminated?: boolean;

  notes?: string[];
  /**
   * Used by UI to signal if the notes for the plant have been requested
   * from the server.
   */
  notesRequested?: boolean;
  userId?: string;
}

interface BizPlantMap {
  [mongoId: string]: BizPlant;
}

interface UiPlantsNote {
  date: number; // Is this right?
  metrics?: LastMetricDates;
}

interface UiPlants {
  [mongoId: string]: UiPlantsValue;
}

interface PlantItemProps {
  dispatch: import('redux').Dispatch;
  plant: UiPlantsValue;
  userCanEdit: boolean;
}

interface PlantEditTerminatedProps {
  dispatch: import('redux').Dispatch;
  interimPlant: UiPlantsValue;
}

interface PlantReadProps {
  dispatch: import('redux').Dispatch;
  history: import('history').History;
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plant: UiPlantsValue;
  plants: UiPlants;
  userCanEdit: boolean;
}

interface PlantsProps {
  history: import('history').History;
  match: import('react-router').match<any>;
}

interface UiPlantLocation {
  _id: string;
  title: string;
  x: number;
  y: number;
}

interface UiPlantLocationCanvas {
  canvasHeight: number;
  plants: Record<string, UiPlantLocation>;
}

interface PlantEditProps {
  dispatch: import('redux').Dispatch;
  history: import('history').History;
  interimPlant: UiPlantsValue;
  locations: UiLocations;
  user: UiUsersValue;
  users: UiUsers;
}
