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
      _id: String;
    };
    files?: Array<Multer.File>;
    logout: Function;
    logIn: Function;
  }
}

declare type ImageSizeName =
  'orig' |
  'xl' |
  'lg' |
  'md' |
  'sm' |
  'thumb';

declare type Role = 
  'owner' |
  'manager' |
  'member';
