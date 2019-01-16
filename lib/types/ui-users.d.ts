
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
