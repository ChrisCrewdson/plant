
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
