/*
In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export
is considered a module. Conversely, a file without any top-level import or export declarations
is treated as a script whose contents are available in the global scope (and therefore to
modules as well).
*/

// Definitions for all User objects

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
  email?: string;
  facebook?: DbUserFacebook;
  google?: DbUserGoogle;
  name?: string;
  updatedAt: Date;
}

type DbUserTiny = Pick<DbUser, '_id' | 'createdAt' | 'name'>;

type BizUserStatus = 'success';

interface BizUser {
  _id: string;
  createdAt: Date;
  email?: string;
  facebook?: DbUserFacebook;
  google?: DbUserGoogle;
  name?: string;
  // updatedAt: Date;
  /**
   * This is an array of MongoId strings
   */
  locationIds?: string[];
  activeLocationId?: string;
  isLoggedIn?: boolean;
  status?: BizUserStatus;
}

type UiUserStatus =
  'success' |
  'logout' |
  'failed';

interface UiUser {
  activeLocationId?: string; // "5851d7d52967xxxxxxxxx"
  isLoggedIn: boolean;
  locationIds: string[]; // ["5851d7d52967xxxxxxxxx"...
  name: string; // "John Smith"
  status: UiUserStatus;
  _id: string; // "57b4e90xxxxxxxxxxxx"
}


interface UiUsersValue {
  _id: string;
  activeLocationId: string;
  createdAt: string;
  name: string;
  locationIds: string[];
}

interface UiUsers {
  [id: string]: UiUsersValue;
}

interface UiReduxState {
  interim?: UiInterim;
  locations?: UiLocations;
  notes?: UiNotes;
  plants?: UiPlants;
  user?: UiUser;
  users?: UiUsers;
}
