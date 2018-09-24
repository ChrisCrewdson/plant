
interface FacebookOAuthJson {
  emails: Array<string>|string;
}
  
interface FacebookOAuthName {
  givenName: string;
  familyName: string;
}

interface FacebookOAuth {
  _json: FacebookOAuthJson;
  name: FacebookOAuthName;
}

interface GoogleOAuth {
  _json: object;
  displayName: string;
  emails: Array<object>; // { value: string ==> email address }
}
