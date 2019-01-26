// These types match what is in the Database that will be returned for the
// collection if no fields are specified in the DB request

// TODO: The string|ObjectID types should be
// split into 2 interfaces. One that is strictly
// the collection representation in the DB
// and the other the type that is returned to
// the business layer.
// Example: DbNote and BizNote

interface DbLocationStationObj {
  name: string;
  enabled: boolean;
}

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

interface DbUserFacebook {
  first_name: string;
  gender: string;
  id: string;
  last_name: string;
  link: string;
  locale: string;
  timezone: number; // offset from UTC
  updated_time: string;
  verified: boolean;
}

interface DbUserGoogle {
  circledByCount: number;
  displayName: string;
  domain: string;
  emails: object[];
  etag: string;
  gender: string;
  id: string;
  image: object;
  isPlusUser: boolean;
  kind: string;
  name: object;
  objectType: string;
  url: string;
  verified: boolean;
}

interface DbUser {
  _id: import('mongodb').ObjectID;
  createdAt: Date;
  email?: string
  facebook?: DbUserFacebook;
  google?: DbUserGoogle;
  name?: string;
  updatedAt: Date;
}

interface DbUserTiny {
  _id: import('mongodb').ObjectID;
  createdAt: Date;
  name?: string;
}

declare type BizUserStatus = 'success';

interface BizUser {
  _id: string;
  createdAt: Date;
  email?: string
  facebook?: DbUserFacebook;
  google?: DbUserGoogle;
  name?: string;
  updatedAt: Date;
  /**
   * This is an array of MongoId strings
   */
  locationIds?: string[];
  activeLocationId?: string;
  isLoggedIn?: boolean;
  status?: BizUserStatus;
}

interface LocationLocCache {
  [key: string]: Geo;
}
