import { DbNote } from './model-note';

interface GoogleOAuthJson {
  id: string;
}

export interface GoogleOAuth {
  _json: GoogleOAuthJson;
  displayName: string;
  /**
   * Objects look like: { value: string ==> email address }
   */
  emails: object[];
}

interface FacebookOAuthJson {
  emails: string[]|string;
  id: string;
}

interface FacebookOAuthName {
  givenName: string;
  familyName: string;
}

export interface FacebookOAuth {
  _json: FacebookOAuthJson;
  name: FacebookOAuthName;
}

// Generic definitions that apply to multiple models.
// For specific models see the model-<name>.d.ts file.

// The model-<name>.d.ts files should follow a specific pattern where the shapes
// for the DB are defined at the top, then the Biz layer and then the Ui layer.
// Each shape will build on and change the previous shape.

export type DbShape = DbLocation | DbNote | DbPlant | DbUser | DbUserTiny;

export type DbShapes = DbLocation[] | DbNote[] | DbPlant[] | DbUser[] | DbUserTiny[];

export type DbCollectionName = 'user' | 'plant' | 'note' | 'location';

export interface UserDetails {
  // TODO: There will only ever be facebook or google set here so this show be a union
  // type such as:
  // socialJson: FacebookOAuthJson|GoogleOAuthJson;
  facebook?: FacebookOAuthJson;
  google?: GoogleOAuthJson;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  email?: string;
}
