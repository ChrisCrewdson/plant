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
 * An interface mapping string indexes to string values in an object
 */
interface StringStringObject {
  [key: string]: string;
}

/**
 * An interface mapping string indexes to any values
 */
interface StringAnyObject {
  [key: string]: any;
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

interface HelperMakeRequestOptions {
  headers: StringStringObject;
  authenticate: boolean;
  followRedirect: boolean;
  url: string;
  method: string;
  body: object;
  text: boolean;
}
