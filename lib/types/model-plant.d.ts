
declare type TerminatedReason =
'culled' |
'died' |
'transferred';

declare type PlantDateFieldNames =
  'plantedDate' |
  'purchasedDate' |
  'terminatedDate';

interface BasePlant {
  botanicalName?: string;
  commonName?: string;
  description?: string;
  loc?: Geo;
  plantedDate?: number; // YYYYMMDD
  /**
   * TODO: In the UI this will be a string while editing but in DB will be a value or be missing.
   *       So DbPlant cannot inherit this without changing this type to a number
   */
  price?: number|string;
  purchasedDate?: number; // YYYYMMDD
  terminatedReason?: TerminatedReason;
  terminatedDate?: number;
  terminatedDescription?: string;
  title: string;
  /**
   * tags is currently not used but is in the validation code so adding it here.
   */
  tags: string[];
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
  /**
   * An array of MongoId strings representing notes
   */
  notes?: string[];
}

interface UiPlantsValue extends BasePlant {
  isNew?: boolean;
  _id: string;
  notes: UiPlantsNote[];
  locationId: string;
  isTerminated?: boolean;
  /**
   * Used by UI to signal if the notes for the plant have been requested
   * from the server.
   */
  notesRequested?: boolean;
  userId?: string;
  errors: Dictionary<string>;
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
  userCanEdit: boolean;
  plant: UiPlantsValue;
}

interface PlantEditTerminatedProps {
  dispatch: import('redux').Dispatch;
  interimPlant: UiPlantsValue;
}

interface PlantReadProps {
  dispatch: import('redux').Dispatch;
  history: import('history').History;
  interim: UiInterim;
  userCanEdit: boolean;
  notes: UiNotes;
  locations: UiLocations;
  plant: UiPlantsValue;
  plants: UiPlants;
}

interface PlantsProps {
  match: import('react-router').match<any>;
  history: import('history').History;
}

interface UiPlantLocation {
  _id: string;
  title: string;
  x: number;
  y: number;
}

interface UiPlantLocationCanvas {
  plants: Dictionary<UiPlantLocation>;
  canvasHeight: number;
}

interface PlantPropsParams {
  id?: string;
}

interface PlantPropsSearchParams {
  get: Function;
}

/**
 * The params and searchParams are available when Plant is created during SSR.
 * The match and location are available when this is created via React Router.
 * I've no idea why I did this. Seems to be a terrible design.
 * TODO: Fix this so that the SSR provides shapes that replicate the React Router interfaces.
 */
interface PlantProps {
  params?: PlantPropsParams;
  searchParams?: PlantPropsSearchParams;
  match?: import('react-router').match<any>;
  location?: import('history').Location;
}

interface PlantEditProps {
  dispatch: import('redux').Dispatch;
  history: import('history').History;
  interimPlant: UiPlantsValue;
  user: UiUsersValue
  users: UiUsers;
  locations: UiLocations;
}
