interface LocationsManagerRowUpdateRow {
  _id: string;
  values: string[];
}

interface LocationsManagerRowUpdateMetaLocation {
  _id: string;
  members: Dictionary<Role>;
  stations?: Dictionary<UiLocationsStation>;
}

interface LocationsManagerRowUpdateMeta {
  location: LocationsManagerRowUpdateMetaLocation;
}

interface LocationsManagerRowUpdate {
  row: LocationsManagerRowUpdateRow;
  meta: LocationsManagerRowUpdateMeta;
  isNew: boolean;
}

interface LocationsManagerProps {
  dispatch: import('redux').Dispatch;
  locationIds: string[],
  locations: UiLocations,
  users: UiUsers,
}

interface LocationTileProps {
  _id: string;
  dispatch: import('redux').Dispatch;
  numPlants: number;
  title: string;
}
