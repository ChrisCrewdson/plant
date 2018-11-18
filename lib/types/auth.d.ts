
interface FacebookOAuthJson {
  emails: string[]|string;
  id: string;
}
  
interface FacebookOAuthName {
  givenName: string;
  familyName: string;
}

interface FacebookOAuth {
  _json: FacebookOAuthJson;
  name: FacebookOAuthName;
}

interface GoogleOAuthJson {
  id: string;
}

interface GoogleOAuth {
  _json: GoogleOAuthJson;
  displayName: string;
  /**
   * Objects look like: { value: string ==> email address }
   */
  emails: object[];
}


interface UserDetails {
  // TODO: There will only ever be facebook or google set here so this show be a union
  // type such as:
  // socialJson: FacebookOAuthJson|GoogleOAuthJson;
  facebook?: FacebookOAuthJson;
  google?: GoogleOAuthJson;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  email?: string;
}

interface QueryBySocialMedia {
  'facebook.id'?: string;
  'google.id'?: string;
}
