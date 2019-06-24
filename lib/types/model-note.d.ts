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
// type NoteMetric = { [key in MetaMetricKey]: number|boolean }

interface NoteMetric {
  height: number;
  girth: number;
  harvestCount: number;
  harvestWeight: number;
  firstBlossom: boolean;
  lastBlossom: boolean;
  firstBud: boolean;
  harvestStart: boolean;
  harvestEnd: boolean;
  leafShedStart: boolean;
  leafShedEnd: boolean;
}

type MetricNoteTypes = 'since' | 'unfound' | 'note' | 'metric';

interface MetricNote {
  noteId: string;
  note?: UiNotesValue;
  sinceLast?: string;
  change?: any;
  type: MetricNoteTypes;
}

type MetricItemMetricTypes = 'height' | 'girth';

interface MetricItem {
  date: import('moment').Moment;
  height?: number;
  girth?: number;
}

interface MetricChangePair {
  prev: MetricItem;
  last: MetricItem;
}

interface DbNote {
  _id: import('mongodb').ObjectID;
  /**
   * Appart from the _id the date is the only other field that's
   * required for this record.
   */
  date: number;
  /**
   * A list of NoteImage objects attached to this note.
   */
  images?: NoteImage[];
  /**
   * The metrics associated with this note
   */
  metrics?: NoteMetric;
  /**
   * The text for the note. Okay for it to be missing.
   */
  note?: string;
  /**
   * These are the IDs of the plants that this note refers to
   * Change the type to a NonEmtpyList<> type if we ever switch to Typescript
   */
  plantIds: import('mongodb').ObjectID[];
  /**
   * The id of the user that created this note
   */
  userId: import('mongodb').ObjectID;
}

interface BizNote extends Omit<DbNote, '_id' | 'plantIds' | 'userId'> {
  _id: string;
  plantIds: string[];
  /**
   * Although showImages is used in the UI layer it might need to be set in the server/biz
   * layer based on the type of request. E.g. if the noteId is in the URL then we show the
   * images for that note.
   */
  showImages?: boolean;
  userId: string;
}

interface BizNoteNew extends Omit<BizNote, '_id' | 'showImages'> {
  _id?: string;
}

interface UiInterimNote extends Omit<BizNoteNew, 'date' | 'userId'> {
  /**
   * At the time of writing this I think that date is sometimes a string. In the note.test.js
   * file there are validation tests that confirms that it's not a string.
   */
  date?: number;
  errors?: Dictionary<string>;
  isNew?: boolean;
  plant?: UiPlantsValue;
  uploadProgress?: UiInterimUploadProgress;
  userId?: string;
}

interface BizNoteMap {
  [id: string]: BizNote;
}

interface DbNoteWithPlants extends DbNote {
  /**
   * An array of plant objects from the plant table that are associated
   * with the note. Should be same number of elements in this array
   * as in the plantIds array and the _id value in the objects in this
   * array should match those in the plantIds array.
   * TODO: I'm fairly sure that this should be refactored to just be
   * an object keyed off plantIds.
   */
  plants: BizPlant[];
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
