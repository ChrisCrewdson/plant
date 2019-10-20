// Definitions file for Plant Project

type NonEmptyList<T> = T[] & { 0: T };

// Now included with Typescript 3.5+
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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
    body?: any;
    /**
     * I'm sure that this is not always available on the req object unless the Multer middleware
     * always adds it?
     * TODO: Need to test this. If it's not always available then work out how to type this.
     */
    files: {
      [fieldname: string]: Multer.File[];
    } | Multer.File[];
    isAuthenticated?: Function;
    logger: Logger;
    logIn: Function;
    logout: Function;
    user?: BizUser;
  }
}

declare type GeoType = 'Point';

interface GeoCoords {
  /** Longitude */
  0: number;
  /** Latitude */
  1: number;
}

interface Geo {
  type: GeoType; // "Point" - is this the only value I know of that's valid
  coordinates: GeoCoords;
}

type GeoCallback = (err: PositionError|Error|null, geo?: Geo) => void;

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
  sizes?: NoteImageSize[];
}

interface DerivedMulterFile {
  multerFile: Express.Multer.File;
  noteFile: UploadedNoteFile;
}

type ServerFunc = (port?: number, mongoConnection?: string) => Promise<import('net').Server>;


interface Window {
  [key: string]: any;
  // FormData: Function;
}

interface Global extends NodeJS.Global {
  [key: string]: any;
  // window: Window;
  // requestAnimationFrame?: (callback: Function) => void;
}

type Html5InputTypes =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';
