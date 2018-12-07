// Definitions file for Plant Project

interface Logger {
  trace: Function;
  info: Function;
  warn: Function;
  error: Function;
  fatal: Function;
  security: Function;
  time: Function;
  timeEnd: Function;
}

declare namespace Express {
  export interface Request {
    logger: Logger;
    user?: {
      _id: string;
    };
    files?: Multer.File[];
    logout: Function;
    logIn: Function;
    isAuthenticated?: Function;
  }
}

declare type Role = 
  'owner' |
  'manager' |
  'member';

declare type GeoType = 'Point';

interface GeoCoords {
  0: number;
  1: number;
}
  
interface Geo {
  type: GeoType; // "Point" - is this the only value I know of that's valid
  coordinates: GeoCoords;
}

/**
 * An interface mapping string indexes to T values in an object
 */
interface Dictionary<T> {
  [key: string]: T;
}

interface AwsKey {
  Key: string;
}

interface UploadFile {
  multerFile: Express.Multer.File;
  noteFile: NoteImage;
}

interface UploadFileData {
  files: DerivedMulterFile[];
  noteid: string;
  userid: string;
}

interface UploadedNoteFile {
  id: string;
  ext: string;
  originalname: string;
  size: number;
}

interface DerivedMulterFile {
  multerFile: Express.Multer.File;
  noteFile: UploadedNoteFile;
}

/**
 * Used by tests making HTTP requests to specify the options for the request
 */
interface HelperMakeRequestOptions {
  headers?: Dictionary<string>;
  authenticate: boolean;
  followRedirect?: boolean;
  url: string;
  method?: string;
  body?: object;
  text?: boolean;
}

interface HelperData {
  port?: number;
  userId?: string;
  user?: any; // TODO: Change this to the interface that the DB returns
}

interface AjaxOptions {
  beforeSend? (jqXHR: JQueryXHR, settings: JQueryAjaxSettings): any;
  contentType?: string;
  data?: any;
  error?: Function;
  failure: Function;
  fileUpload?: boolean;
  progress?: Function;
  success: Function;
  type?: string;
  url: string;
  note?: any;
}
