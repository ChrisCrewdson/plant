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

interface NoteImageSize {
  name: ImageSizeName; // name of the size, e.g. thumb, sm, md, lg, xl
  width: Number; // (int32) pixels wide, e.g. 100, 500, 1000, 1500, 2000
}

interface NoteImage {
  id: String; // MongoId that corresponds to the name of the file in S3
  ext: String; // file extension e.g. jpg, png
  originalname: String; // original name of the file when it was uploaded
  size: Number; // size in bytes of the original file
  sizes: Array<NoteImageSize>; // an array of sizes
}

interface Note {
  _id: String;
  date: Number;
  note: String 
  plantIds: Array<String>;
  userId: String;
  images?: Array<NoteImage>; // An array of images
  metrics?: Object; // - an object with key/value pairs. Values are numbers or boolean.
  //- See the app/libs/utils.js file for possible keys in this object and the data types
}

