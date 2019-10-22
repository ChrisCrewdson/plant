
interface LocationStation {
  name: string;
  enabled: boolean;
}

type Role =
  'owner' |
  'manager' |
  'member';

interface DbLocation {
  _id: import('mongodb').ObjectID;
  createdBy: import('mongodb').ObjectID;
  loc?: Geo;
  members: Record<string, Role>;
  stations?: Record<string, LocationStation>;
  title: string;
}

interface BizLocation extends Omit<DbLocation, '_id' | 'createdBy'> {
  /**
   * Needs to be optional for when we create a Location
   */
  _id?: string;
  createdBy: string;
  plantIds?: string[];
}

interface UiLocationsValue extends BizLocation {
  _id: string;
  // loc: Geo;
  // createdBy: string;
  // members: Record<string, Role>;
  stations: Record<string, LocationStation>;
  // title: string;
  plantIds: string[];
}

// interface UiLocationsValue {
//   _id: string;
//   loc: Geo;
//   createdBy: string;
//   members: Record<string, Role>;
//   stations: Record<string, LocationStation>;
//   title: string;
//   plantIds: string[];
// }

/**
 * The key is the MongoId and the value is the document
 */
type UiLocations = Record<string, UiLocationsValue>;
