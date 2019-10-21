// Definitions file for Plant Project

// Currently NonEmptyList is not used anywhere.
// Plan to tag the plantIds in a Note with this as there
// always has to be at least 1 plant for each note.
type NonEmptyList<T> = T[] & { 0: T };

// Now included with Typescript 3.5+
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/*
In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export
is considered a module. Conversely, a file without any top-level import or export declarations
is treated as a script whose contents are available in the global scope (and therefore to
modules as well).
*/

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

// eslint-disable-next-line @typescript-eslint/no-namespace
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

type GeoType = 'Point';

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
