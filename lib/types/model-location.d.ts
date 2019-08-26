interface DbLocationStationObj {
  name: string;
  enabled: boolean;
}

declare type Role =
  'owner' |
  'manager' |
  'member';

interface DbLocation {
  _id: import('mongodb').ObjectID;
  createdBy: import('mongodb').ObjectID;
  loc?: Geo;
  members: Dictionary<Role>;
  stations?: Dictionary<DbLocationStationObj>;
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

type UpsertLocationMemberFn = (action: string, data: UpsertLocationMember, logger: Logger) => Promise<import('mongodb').UpdateWriteOpResult>;
type UpsertLocationMemberFnBound = (data: UpsertLocationMember, logger: Logger) => Promise<import('mongodb').UpdateWriteOpResult>;

type UpsertLocationWeatherFn = (action: string, data: UpsertLocationWeather, logger: Logger) => Promise<import('mongodb').UpdateWriteOpResult>;
type UpsertLocationWeatherFnBound = (data: UpsertLocationWeather, logger: Logger) => Promise<import('mongodb').UpdateWriteOpResult>;

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
  members: Dictionary<Role>;
  stations: Dictionary<UiLocationsStation>;
  title: string;
  plantIds: string[];
}

/**
 * The key is the MongoId and the value is the document
 */
interface UiLocations {
  [id: string]: UiLocationsValue;
}
