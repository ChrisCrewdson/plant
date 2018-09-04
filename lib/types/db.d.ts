// These types match what is in the Database that will be returned for the
// collection if no fields are specified in the DB request

// TODO: The string|ObjectID types should be
// split into 2 interfaces. One that is strictly
// the collection representation in the DB
// and the other the type that is returned to
// the business layer.
// Example: DbNote and BizNote

interface DbLocation {
  _id: string|import('mongodb').ObjectID;
}

interface DbNoteImageSize {
  name: ImageSizeName;
  width: number;
}

interface DbNoteImage {
  id: string;
  ext: string;
  originalname: string;
  size: Number; // file size in bytes
  sizes: Array<DbNoteImageSize>;
}

interface DbNoteMetric {
  height: number;
}

interface DbNote {
  _id: string|import('mongodb').ObjectID;
  plantIds: Array<string|import('mongodb').ObjectID>;
  date: Number;
  userId: string|import('mongodb').ObjectID;
  images: Array<DbNoteImage>;
  metrics: DbNoteMetric;
}

interface DbNoteWithPlants extends DbNote {
  plants: Object[];
}

interface DbPlant {
  _id: string|import('mongodb').ObjectID;
  plantIds: Array<string|import('mongodb').ObjectID>;
  locationId: string|import('mongodb').ObjectID;
  date: Number;
  userId: string|import('mongodb').ObjectID;
}

