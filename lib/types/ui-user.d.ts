declare type UiUserStatus =
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
