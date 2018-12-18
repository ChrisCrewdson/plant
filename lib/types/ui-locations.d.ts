
interface UiLocationsLoc {
  type: string;
  coordinates: object;
}

interface UiLocationsStation {
  name: string;
  enabled: boolean;
}

interface UiLocationsValue {
  _id: string;
  loc: UiLocationsLoc;
  createdBy: string;
  members: Dictionary<Role>;
  stations: Dictionary<UiLocationsStation>
  title: string;
  plantIds: string[];
}

interface UiLocations {
  [id: string]: UiLocationsValue;
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
