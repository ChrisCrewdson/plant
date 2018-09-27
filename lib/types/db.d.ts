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

interface DbLocationStations {
  [key: string]: DbLocationStationObj
}

interface DbLocationMembers {
  [id: string]: Role;
}

interface DbLocation {
  _id: import('mongodb').ObjectID;
  createdBy: import('mongodb').ObjectID;
  loc?: Geo;
  members: DbLocationMembers;
  stations?: DbLocationStations;
  title: string;
}

interface BizLocation {
  _id?: string; // Only ? before creating. Do we need another interface to express the created one?
  createdBy: string;
  loc?: Geo;
  members: DbLocationMembers;
  stations?: DbLocationStations;
  title: string;
}

interface DbNoteImageSize {
  name: ImageSizeName;
  width: number;
}

interface DbNoteImage {
  id: string;
  ext: string;
  originalname: string;
  size: number; // file size in bytes
  sizes: Array<DbNoteImageSize>;
}

interface DbNoteMetric {
  height: number;
}

interface DbNote {
  _id: import('mongodb').ObjectID;
  plantIds: Array<import('mongodb').ObjectID>;
  date: number;
  userId: import('mongodb').ObjectID;
  images: Array<DbNoteImage>;
  metrics: DbNoteMetric;
}

interface BizNote {
  _id: string;
  plantIds: Array<string>;
  date: number;
  userId: string;
  images: Array<DbNoteImage>;
  metrics: DbNoteMetric;
  showImages?: boolean;
}

interface BizNoteMap {
  [id: string]: BizNote;
}


interface DbNoteWithPlants extends DbNote {
  plants: Object[];
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
  emails: Array<object>;
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

interface BizUser {
  _id: string;
  createdAt: Date;
  email?: string
  facebook?: DbUserFacebook;
  google?: DbUserGoogle;
  name?: string;
  updatedAt: Date;
  locationIds?: Array<string>;
}
