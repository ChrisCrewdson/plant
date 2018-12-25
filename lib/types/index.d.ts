// Definitions file for Plant Project

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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
    user?: BizUser;
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
  /** Longitude */
  0: number;
  /** Latitude */
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
  server?: (port: number | undefined, mongoConnection: string) => Promise<import('net').Server>;
  app?: import('net').Server;
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

interface ActionMethodResult {
  type: string;
  payload?: Dictionary<any>;
}

declare type ActionMethod = (payload?: Dictionary<any> | string) => ActionMethodResult;

/**
 * Also using this for AddLocationButtonProps
 */
interface AddPlantButtonProps {
  mini?: boolean;
  show: boolean;
  style?: object;
}

interface Window {
  [key:string]: any;
  // FormData: Function;
}

interface Global extends NodeJS.Global {
  [key: string]: any;
  // window: Window;
  // requestAnimationFrame?: (callback: Function) => void;
}

declare type MetaMetricType =
  'length' |
  'count' |
  'toggle' |
  'weight';

interface MetaMetric {
  key: string;
  label: string;
  placeholder: string;
  type: MetaMetricType;
}
