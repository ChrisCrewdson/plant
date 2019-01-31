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
