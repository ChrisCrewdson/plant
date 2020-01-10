
export type ImageSizeName =
  'orig' |
  'xl' |
  'lg' |
  'md' |
  'sm' |
  'thumb';

export interface NoteImageSize {
  /**
   * name of the size, e.g. thumb, sm, md, lg, xl
   */
  name: ImageSizeName;
  /**
   *  how many pixels wide, e.g. 100, 500, 1000, 1500, 2000
   */
  width: number;
}

export interface NoteImage {
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
 * These are the properties in the metrics object that have number values
 */
export const noteMetricNumberProps = [
  'height',
  'girth',
  'harvestCount',
  'harvestWeight',
] as const;
type NoteMetricNumberPropsType = typeof noteMetricNumberProps[number];
export type NoteMetricNumber = Record<NoteMetricNumberPropsType, number>;

/**
 * These are the properties in the metrics object that have boolean values
 */
const noteMetricBoolProps = [
  'firstBlossom',
  'lastBlossom',
  'firstBud',
  'harvestStart',
  'harvestEnd',
  'leafShedStart',
  'leafShedEnd',
] as const;
type NoteMetricBoolPropsType = typeof noteMetricBoolProps[number];
type NoteMetricBool = Record<NoteMetricBoolPropsType, boolean>;

export type NoteMetric = NoteMetricNumber & NoteMetricBool;

export type MetaMetricKey = keyof NoteMetric;

/**
 * These are the object types that can be rendered in a list of Notes.
 * So when React is rendering a Plant with its Notes there will be computed
 * notes spliced in with the user entered Notes.
 * since: A measure of the time "since" the last note.
 * unfound: A reference to a Note that was not found in the Note collection (bug/error)
 * note: A user entered note stored in the DB's Note collection
 * metric: A derived object based on metric changes between two user entered Notes.
 */
type MetricNoteTypes = 'since' | 'unfound' | 'note' | 'metric';

export interface MetricNote {
  noteId: string;
  note?: UiNotesValue;
  sinceLast?: string;
  change?: any;
  type: MetricNoteTypes;
}

export type MetricItemMetricTypes = 'height' | 'girth';

export interface MetricItem {
  date: import('moment').Moment;
  height?: number;
  girth?: number;
}

export interface MetricChangePair {
  prev: MetricItem;
  last: MetricItem;
}

export interface DbNote {
  _id: import('mongodb').ObjectID;
  /**
   * Apart from the _id the date is the only other field that's
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
   * TODO: Change the type to a NonEmptyList<> type if we ever switch to Typescript
   */
  plantIds: import('mongodb').ObjectID[];
  /**
   * The id of the user that created this note
   */
  userId: import('mongodb').ObjectID;
}

export interface BizNote extends Omit<DbNote, '_id' | 'plantIds' | 'userId'> {
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

export interface BizNoteNew extends Omit<BizNote, '_id' | 'showImages'> {
  _id?: string;
}

interface UiInterimUploadProgress {
  value: number;
  max: number;
  note?: UiNotesValue;
}

export interface UiInterimNote extends Omit<BizNoteNew, 'date' | 'userId'> {
  /**
   * At the time of writing this I think that date is sometimes a string. In the note.test.js
   * file there are validation tests that confirms that it's not a string.
   */
  date?: string;
  errors?: Record<string, string>;
  isNew?: boolean;
  plant?: UiPlantsValue;
  uploadProgress?: UiInterimUploadProgress;
  userId?: string;
}

export type BizNoteMap = Record<string, BizNote>;

export interface DbNoteWithPlants extends DbNote {
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
// type UiNotesMetaState =
// 'new' |
// 'saved' |
// 'error' |
// 'deleted';

// interface UiNotesMeta {
//   state: UiNotesMetaState;
//   errors: string[];
// }

export interface UiNotesValue {
  _id: string;
  date: number;
  // meta: UiNotesMeta;
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

export type UiNotes = Record<string, UiNotesValue>;

export interface ImageCompleteQuery {
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

export interface ImageCompleteBody {
  sizes: NoteImageSize[];
  metadata: ImageCompleteMetadata;
}

export interface NoteImageUpdateData {
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
