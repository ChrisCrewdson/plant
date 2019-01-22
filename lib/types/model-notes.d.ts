declare type ImageSizeName =
  'orig' |
  'xl' |
  'lg' |
  'md' |
  'sm' |
  'thumb';

interface NoteImageSize {
  /**
   * name of the size, e.g. thumb, sm, md, lg, xl
   */
  name: ImageSizeName;
  /**
   *  how many pixels wide, e.g. 100, 500, 1000, 1500, 2000
   */
  width: number;
}

interface NoteImage {
  /**
   * MongoId that corresponds to the name of the file in S3
   */
  id: string;
  /**
   * file extension e.g. jpg, png
   */
  ext: string;
  /**
   * original name of the file when it was uploaded
   */
  originalname: string;
  /**
   * size in bytes of the original file
   */
  size: number;
  /**
   * an array of sizes
   */
  sizes: NoteImageSize[];
}

/**
 * An object with key/value pairs. Values are numbers or boolean.
 */
type NoteMetric = { [key in MetaMetricKey]: number|boolean }

interface MetricNote {
  noteId: string;
  note: string;
  sinceLast: any;
  change: any;
  type: string;
}

interface DbNote {
  _id: import('mongodb').ObjectID;
  plantIds: import('mongodb').ObjectID[];
  userId: import('mongodb').ObjectID;
  date: number;
  images?: NoteImage[];
  metrics?: NoteMetric;
  note?: string;
}

interface BizNote extends Omit<DbNote, '_id' | 'plantIds' | 'userId'> {
  _id: string;
  plantIds: string[];
  userId: string;
  /**
   * Although showImages is used in the UI layer it might need to be set in the server/biz
   * layer based on the type of request. E.g. if the noteId is in the URL then we show the
   * images for that note.
   */
  showImages?: boolean;
}

interface BizNoteMap {
  [id: string]: BizNote;
}

interface DbNoteWithPlants extends DbNote {
  plants: Object[]; // TODO: Type this
}


/**
 * new = created in UI but not saved yet
 * saved = upsertNoteSuccess has been received
 * error = an error happened saving / validating etc.
 * deleted = ajax request to delete object not complete yet
 */
declare type UiNotesMetaState =
'new' |
'saved' |
'error' |
'deleted';

interface UiNotesMeta {
  state: UiNotesMetaState;
  errors: string[];
}

interface UiNotesValue {
  _id: string;
  date: number;
  meta: UiNotesMeta;
  note?: string;
  plantIds: string[];
  showImages?: boolean;
  userId: string;
  metrics?: NoteMetric;
  /**
   * Used when this is in the interim object
   */
  isNew?: boolean;
  images?: NoteImage[];
}

interface UiNotes {
  [id: string]: UiNotesValue;
}

interface ImageCompleteQuery {
  token?: string;
}

interface ImageCompleteMetadata {
  userid: string;
  /**
   * ImageId
   */
  id: string;
  noteid: string;
  originalname: string;
}

interface ImageCompleteBody {
  sizes: NoteImageSize[];
  metadata: ImageCompleteMetadata;
}

interface ImageCompleteRequest {
  logger: Logger;
  body?: ImageCompleteBody;
  query?: ImageCompleteQuery;
}

interface NoteImageUpdateData {
  /**
   * NoteId
   */
  _id: string;
  userId: string;
  imageId: string;
  sizes: NoteImageSize[];
}

/*
Object of notes:
{
  <mongoId>: {
    meta: {
      // new = created in UI but not saved yet
      // saved = upsertNoteSuccess has been received
      // error = an error happened saving / validating etc.
      // deleted = ajax request to delete object not complete yet
      state: 'new',
      errors: 'an array of errors'
    },
    _id: 'mongoId - same as key'
    date: 20160101 - a number,
    note: 'string',
    plantIds: 'an array of strings',
    userId: 'mongoId - identifies user',
    showImages: true/undefined
  }
}
*/
