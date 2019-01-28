
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
  terminatedDate?: number;
  terminatedDescription?: string;
  terminatedReason?: TerminatedReason;
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
  userId: string;
}

interface UiPlantsValue extends BasePlant {
  _id: string;
  errors: Dictionary<string>;
  isNew?: boolean;
  isTerminated?: boolean;
  locationId: string;
  notes: UiPlantsNote[];
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
  plants: Dictionary<UiPlantLocation>;
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
  location?: import('history').Location;
  match?: import('react-router').match<any>;
  params?: PlantPropsParams;
  searchParams?: PlantPropsSearchParams;
}

interface PlantEditProps {
  dispatch: import('redux').Dispatch;
  history: import('history').History;
  interimPlant: UiPlantsValue;
  locations: UiLocations;
  user: UiUsersValue
  users: UiUsers;
}
