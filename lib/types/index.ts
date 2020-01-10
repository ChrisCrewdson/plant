
// Definitions file for Plant Project

// Currently NonEmptyList is not used anywhere.
// Plan to tag the plantIds in a Note with this as there
// always has to be at least 1 plant for each note.
type NonEmptyList<T> = T[] & { 0: T };

// Now included with Typescript 3.5+
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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
