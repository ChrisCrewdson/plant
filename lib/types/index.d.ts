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

interface StringStringObject {
  [key: string]: string;
}

interface AwsKey {
  Key: string;
}
