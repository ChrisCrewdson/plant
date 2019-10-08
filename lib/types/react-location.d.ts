// Definitions for Location related components that apply only to React components.
// For definitions on the shape of a Location data object use the model-location.d.ts file.

interface LocationsManagerRowUpdateRow {
  _id: string;
  values: string[];
}

interface LocationsManagerRowUpdateMetaLocation {
  _id: string;
  members: Record<string, Role>;
  stations?: Record<string, UiLocationsStation>;
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
  locationIds: string[];
  locations: UiLocations;
  users: UiUsers;
}

interface LocationTileProps {
  _id: string;
  dispatch: import('redux').Dispatch;
  numPlants: number;
  title: string;
}


// This state is an object with locationId's as keys and
// each value is an object with:
// _id
// title
// loc (optional)
// plantIds: [plantId1, ...]

// Location collection in DB:

/*
{
  "_id" : ObjectId("5851d7..."),
  "createdBy" : ObjectId("57b4e9..."),
  "members" : {
    "57b4e90d9...": "owner",
  },
  "title" : "The Orchard",
  "loc" : {
    "type" : "Point",
    "coordinates" : {
      "0" : -99.9999,
      "1" : 66.66666
    }
  }
}
*/

interface LocationPropsMatchParams {
  id: string;
  slug: string;
}

interface LocationPropsMatch {
  params: LocationPropsMatchParams;
}

interface LocationProps {
  match: LocationPropsMatch;
}

interface LocationState {
  filter: string;
  locations?: Record<string, UiLocationsValue>;
  allLoadedPlants?: Record<string, UiPlantsValue>;
  interim?: UiInterim;
  authUser?: UiUsersValue;
}
