/*
In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export
is considered a module. Conversely, a file without any top-level import or export declarations
is treated as a script whose contents are available in the global scope (and therefore to
modules as well).
*/

interface DbLocationStationObj {
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
  stations?: Record<string, DbLocationStationObj>;
  title: string;
}

interface BizLocation extends Omit<DbLocation, '_id' | 'createdBy'> {
  /**
   * TODO: Check if this is optional.
   */
  _id?: string;
  createdBy: string;
  plantIds?: string[];
}

// UpsertLocation structures Start

interface UpsertLocationBodyBase {
  action: string;
  locationId: string;
}

interface UpsertLocationMemberBody extends UpsertLocationBodyBase {
  role: Role;
  userId: string;
}
interface UpsertLocationWeatherBody extends UpsertLocationBodyBase {
  stationId: string;
  name: string;
  enabled: string;
}
interface UpsertLocationUser {
  _id: string;
}

interface UpsertLocationMember {
  user: UpsertLocationUser;
  body: UpsertLocationMemberBody;
}

interface UpsertLocationWeather {
  user: UpsertLocationUser;
  body: UpsertLocationWeatherBody;
}

// UpsertLocation structures End

interface LocationLocCache {
  [key: string]: Geo;
}


interface UiLocationsLoc {
  type: string;
  coordinates: object;
}

interface UiLocationsStation {
  name: string;
  enabled: boolean;
}

interface UiLocationsValue {
  _id: string;
  loc: UiLocationsLoc;
  createdBy: string;
  members: Record<string, Role>;
  stations: Record<string, UiLocationsStation>;
  title: string;
  plantIds: string[];
}

/**
 * The key is the MongoId and the value is the document
 */
interface UiLocations {
  [id: string]: UiLocationsValue;
}
