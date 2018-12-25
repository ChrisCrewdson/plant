
interface UiUsersLocation {
  id: string; // a location _id
  role: Role;
}

interface UiUsersValue {
  _id: string;
  createdAt: string;
  name: string;
  locationIds: UiUsersLocation[];
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
