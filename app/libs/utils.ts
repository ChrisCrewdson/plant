import { ObjectID } from 'bson';
import moment, { Moment } from 'moment';
import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';
import slug from 'slugify';
import { produce } from 'immer';
import globalThat from 'globalthis';

import * as constants from './constants';
import { MetaMetricKey, BizNote } from '../../lib/db/mongo/model-note';


type MetaMetricType =
  'length' |
  'count' |
  'toggle' |
  'weight';

export interface MetaMetric {
  key: MetaMetricKey;
  label: string;
  placeholder: string;
  type: MetaMetricType;
}

const { gisMultiplier } = constants;

function makeMongoId(): string {
  return new ObjectID().toString();
}

function makeMongoIdObject(): ObjectID {
  return new ObjectID();
}

/**
 * Make a slug from text
 */
function makeSlug(text: string): string {
  if (!text) {
    // console.warn('text is falsy in makeSlug:', text);
    return '';
  }

  const lower = text.toString().toLowerCase();

  return slug(lower.replace(/[/()]/g, ' '));
}

interface MakeUrlOptions {
  title: string;
  _id: string;
  /**
   * The `base` is a combination of the schema and domain that will
   * optionally precede the path in the construction of the Url.
   */
  base?: string;
}

/**
 * Make a url with a trailing id
 */
function makeUrl(first: string, { title, _id, base }: MakeUrlOptions): string {
  const path = `/${first}/${makeSlug(title)}/${_id}`;
  if (base) {
    return `${base}${path}`;
  }
  return path;
}

function makePlantUrl(plant: MakeUrlOptions): string {
  return makeUrl('plant', plant);
}

/**
 * Make a /location/location-name-slug/id url from location object
 */
function makeLocationUrl(location: MakeUrlOptions): string {
  return makeUrl('location', location);
}

/**
 * Make a /layout/layout-name-slug/id url from layout object
 */
function makeLayoutUrl(layout: MakeUrlOptions): string {
  return makeUrl('layout', layout);
}

/**
 * Convert a date like object to an Integer
 * @returns - a date in the form YYYYMMDD
 */
function dateToInt(date?: Moment | Date | string | number): number {
  if (moment.isMoment(date)) {
    return dateToInt((date as Moment).toDate());
  } if (isDate(date)) {
    return (date.getFullYear() * 10000)
      + ((date.getMonth() + 1) * 100)
      + date.getDate();
  } if (typeof date === 'string') {
    return dateToInt(new Date(date));
  } if (typeof date === 'number') {
    return date;
  }
  // console.error('Unable to convert in dateToInt:', date);
  throw new Error(`dateToInt(${date}) for typeof date: ${typeof date}`);
}

/**
 * Convert a number to a Date
 */
function intToDate(date: number): Date {
  const year = Math.round(date / 10000);
  const month = Math.round((date - (year * 10000)) / 100);
  const day = Math.round((date - ((year * 10000) + (month * 100))));
  return new Date(year, month - 1, day);
}

/**
 * Convert number to a Moment object
 */
function intToMoment(date: number | string): Moment {
  const intDate = typeof date === 'string'
    ? dateToInt(date)
    : date;
  return moment(intToDate(intDate));
}

/**
 * Change a date in the format of YYYYMMDD to YYYY-MM-DD
 * @param maybeDate - a date in the format of YYYYMMDD
 */
const makeDashDate = (maybeDate?: string | number): string => {
  if (!maybeDate) {
    return '';
  }
  const date = maybeDate.toString();
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
};

/**
 * Convert number date to string date
 */
function intToString(date: number | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return intToMoment(date).format('MM/DD/YYYY');
}

export interface PlantFromBodyPayload extends
  Omit<UiPlantsValue, 'plantedDate' | 'purchasedDate' | 'terminatedDate' | 'isTerminated'> {
  plantedDate: string;
  purchasedDate: string;
  terminatedDate: string;
  isTerminated: string;
  [x: string]: any;
}

/**
 * Converts the body of a POST/PUT to a plant object.
 * @param body - POST/PUT body
 * @returns - body with relevant fields converted to correct data type
 */
function plantFromBody(body: PlantFromBodyPayload): UiPlantsValue {
  // TODO: Make UiPlantsValue Readonly<>
  const returnBody = body as unknown as UiPlantsValue;
  const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
  dateFields.forEach((dateField) => {
    if (body[dateField]) {
      // @ts-ignore - TODO Fix this
      returnBody[dateField] = parseInt(body[dateField], 10);
    }
  });
  if (typeof returnBody.isTerminated === 'string') {
    returnBody.isTerminated = returnBody.isTerminated === 'true';
  }
  return returnBody as UiPlantsValue;
}

/**
 * Filters the plantIds array based on filter
 * @param plantIds - original plantIds to filter
 * @param plants - all the plants available to sort
 * @param filter - optional text to filter title of plant
 * @returns - an array of filtered plantIds
 */
function filterPlants(plantIds: ReadonlyArray<string>,
  plants: object, filter?: string): ReadonlyArray<string> {
  const lowerFilter = (filter || '').toLowerCase();
  return lowerFilter
    ? plantIds.filter((plantId) => {
      // @ts-ignore - TODO Fix this
      const plant = plants[plantId] || {};
      const { title = '', botanicalName = '' } = plant;
      const searchText = `${title.toLowerCase()} ${botanicalName.toLowerCase()}`;
      return searchText.indexOf(lowerFilter) >= 0;
    })
    : plantIds;
}

/**
 * Checks to see if an array of strings is already sorted by the
 * prop provided.
 * @param prop - the property in the object to sort by
 * @param itemIds - an array of Ids
 * @param items - a object that has ids as props
 * @returns - true if already sorted otherwise false
 */
function alreadySorted(prop: string, itemIds: ReadonlyArray<string>,
  items: Record<string, any>): boolean {
  return itemIds.every((itemId, index) => {
    if (index === 0) {
      return true;
    }

    const itemA = items[itemIds[index - 1]];
    const itemB = items[itemId];
    const valueA = (itemA || {})[prop];
    const valueB = (itemB || {})[prop];
    // Check one of these is true:
    // 1. That both values exist and the first is less or equal to the second
    // 2. That first value exists and second doesn't
    // 3. That neither exists.
    // i.e. if values are missing then they must be at the end.
    return (valueA && valueB && valueA <= valueB)
      || (valueA && !valueB) || (!valueA && !valueB);
  });
}

/**
 * Sort the itemIds based on the value of the prop parameter.
 * @param prop - the name of the property from the items object that's being sorted
 * @param itemIds - array of MongoId strings
 * @param items - an object with MongoIds as keys. The values are objects.
 * @returns - an immutable array of sorted itemIds
 */
function sortItems(prop: string, itemIds: ReadonlyArray<string>,
  items: Record<string, any>): ReadonlyArray<string> {
  // TODO: Memoize this method.
  if (!itemIds || !itemIds.length) {
    return itemIds || [];
  }

  if (alreadySorted(prop, itemIds, items)) {
    return itemIds;
  }

  const sorter = (a: string, b: string): number => {
    const itemA = items[a];
    const itemB = items[b];
    if (itemA && itemB) {
      const dateA = itemA[prop];
      const dateB = itemB[prop];
      if (dateA === dateB) {
        return 0;
      }
      return dateA > dateB ? 1 : -1;
    }
    // The following logic puts all the unfound items at the end of the sort.
    if (!itemA && !itemB) {
      return 0;
    }
    if (itemA) {
      return -1;
    }
    return 1;
  };

  return produce(itemIds, (draft) => {
    draft.sort(sorter);
  });
}

/**
 * Sort the noteIds based on the date property.
 * @param noteIds - array of MongoId strings
 * @param notes - an object with MongoIds as keys. The values are note objects.
 * @returns - an immutable array of sorted noteIds
 */
function sortNotes(noteIds: ReadonlyArray<string>,
  notes: Record<string, any>): ReadonlyArray<string> {
  // TODO: Memoize this method
  return sortItems('date', noteIds, notes);
}

/**
 * Sorts the plantIds based on the plant's title
 * @param plantIds - original plantIds to filter
 * @param plants - all the plants available to sort
 * @returns - an immutable array of sorted plantIds
 */
function sortPlants(plantIds: ReadonlyArray<string>,
  plants: Record<string, any>): ReadonlyArray<string> {
  // TODO: Memoize this method
  return sortItems('title', plantIds, plants);
}

/**
 * Filters the plantIds array and sorts based on the plant's title
 * @param plantIds - original plantIds to filter
 * @param plants - all the plants available to sort
 * @param filter - optional text to filter title of plant
 * @returns - an array of sorted and filtered plantIds
 */
function filterSortPlants(plantIds: ReadonlyArray<string>,
  plants: Record<string, any>, filter: string):
ReadonlyArray<string> {
  const filteredPlantIds = filterPlants(plantIds, plants, filter);

  return sortPlants(filteredPlantIds, plants);
}

interface PlantStats {
  total: number;
  alive: number;
}

/**
 * Plant stats
 * @param plantIds
 * @param plants
 */
function plantStats(plantIds: string[], plants: Record<string, any>): PlantStats {
  return {
    total: plantIds.length,
    alive: plantIds.reduce((acc, plantId) => {
      const plant = plants[plantId] || {};
      return plant.isTerminated ? acc : acc + 1;
    }, 0),
  };
}

/**
 * The values of the errors object are arrays. Take the first item out of each array.
 * @param errors - values are arrays
 * @returns - first element of value for each key
 */
function transformErrors(errors?: Record<string, string[]>):
 Record<string, string> | undefined {
  if (!errors) {
    return errors as undefined;
  }
  return Object.keys(errors).reduce(
    (acc: Record<string, string>, key: string) => {
      // Assign first element of errors[key] (which is an array) to acc[key]
      [acc[key]] = errors[key];
      return acc;
    }, {});
}

const shimmedGlobal = globalThat.shim();
type GlobalThis = typeof shimmedGlobal;
const getGlobalThis = (): GlobalThis => shimmedGlobal;

/**
 * Tests to see if JS runtime (window) supports Geo Location
 */
function hasGeo(): boolean {
  return !!(getGlobalThis()?.navigator?.geolocation);
}

/**
 * Gets the current geo location
 */
async function getCurrentGeoPosition(optionsParam: PositionOptions): Promise<Geo> {
  if (!hasGeo()) {
    throw new Error('This device does not have geolocation available');
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000, // 30 seconds
    ...optionsParam,
  };

  return new Promise((resolve, reject) => {
    getGlobalThis().navigator.geolocation.getCurrentPosition(
      (position) => {
      // { type: "Point", coordinates: [ 40, 5 ] }
      // position: {coords: {latitude: 11.1, longitude: 22.2}}
        const geoJson: Geo = {
          type: 'Point',
          coordinates: [
            position.coords.longitude,
            position.coords.latitude,
          ],
        };
        return resolve(geoJson);
      }, (err) => reject(err), options);
  });
}


/**
 * Because math in JS is not precise we need to use integers
 * to subtract 2 number for GIS rebasing
 * @param left - the left number in the operation
 * @param right - the right number in the operation
 * @returns - left - right
 */
function subtractGis(left: number, right: number): number {
  // 7 decimal places in long/lat will get us down to 11mm which
  // is good for surveying which is what we're basically doing here
  return Math.round((left * gisMultiplier) - (right * gisMultiplier)) / gisMultiplier;
}

const getLongLat = (plant: BizPlant): number[] | boolean => {
  const long = plant.loc && plant.loc.coordinates && plant.loc.coordinates[0];
  const lat = plant.loc && plant.loc.coordinates && plant.loc.coordinates[1];
  if (isNumber(long) && isNumber(lat)) {
    return [long, lat];
  }
  return false;
};

/**
 * Rebase the long and lat of the plant locations
 * @param plants - an array of plants with just the _id and loc fields
 * @returns - same array of plants with the locations rebased to 0,0
 */
function rebaseLocations(plants: BizPlant[]): BizPlant[] {
  if (!plants || !plants.length) {
    return plants;
  }

  const northWestPoints = plants.reduce((acc, plant) => {
    const coordinates = getLongLat(plant);
    if (Array.isArray(coordinates)) {
      const [long, lat] = coordinates;
      acc.long = Math.min(acc.long, long);
      acc.lat = Math.min(acc.lat, lat);
    }
    return acc;
  }, { long: 180, lat: 90 });

  return plants.map((plant) => {
    if (!plant.loc) {
      return plant;
    }
    const {
      coordinates: actualCoordinates,
      type,
    } = plant.loc;
    const coordinates = {
      0: subtractGis(actualCoordinates[0], northWestPoints.long),
      1: subtractGis(actualCoordinates[1], northWestPoints.lat),
    };
    return {
      ...plant,
      loc: {
        type,
        coordinates,
      },
    };
  });
}

const metaMetricsRaw: MetaMetric[] = [{
  key: 'height',
  label: 'Height (inches only)', // For Input Component Text
  placeholder: 'Enter height of plant', // Input hint
  type: 'length',
}, {
  key: 'girth',
  label: 'Girth (inches only)',
  placeholder: 'Enter girth of plant',
  type: 'length',
}, {
  key: 'harvestCount',
  label: 'Harvest Count',
  placeholder: 'Enter number of items harvested',
  type: 'count',
}, {
  key: 'harvestWeight',
  label: 'Harvest Weight (lbs only)',
  placeholder: 'Enter weight of harvest',
  type: 'weight',
}, {
  key: 'firstBlossom',
  label: 'First Blossom',
  placeholder: 'Check when first blossom is seen',
  type: 'toggle',
}, {
  key: 'lastBlossom',
  label: 'Last Blossom',
  placeholder: 'Check when last blossom is seen',
  type: 'toggle',
}, {
  key: 'firstBud',
  label: 'First Bud',
  placeholder: 'Check when first bud is seen',
  type: 'toggle',
}, {
  key: 'harvestStart',
  label: 'Harvest Start',
  placeholder: 'Check when harvest starts',
  type: 'toggle',
}, {
  key: 'harvestEnd',
  label: 'Harvest End',
  placeholder: 'Check when harvest ends',
  type: 'toggle',
}, {
  key: 'leafShedStart',
  label: 'Leaf Shed Start',
  placeholder: 'Check when leaf shed (abscission) starts',
  type: 'toggle',
}, {
  key: 'leafShedEnd',
  label: 'Leaf Shed End',
  placeholder: 'Check when leaf shed (abscission) ends',
  type: 'toggle',
}];

const metaMetrics: MetaMetric[] = produce({}, () => metaMetricsRaw);

/**
 * Converts the body from a POST (Upsert) operation from a client into a BizNote
 */
function noteFromBody(body: any): BizNote {
  // eslint-disable-next-line no-param-reassign
  body.date = parseInt(body.date, 10);

  if (body.metrics) {
    Object.keys(body.metrics).forEach((key) => {
      const metaMetric = metaMetrics.find((mm) => mm.key === key);
      if (metaMetric) {
        switch (metaMetric.type) {
          case 'toggle':
            // eslint-disable-next-line no-param-reassign
            body.metrics[key] = body.metrics[key] === 'true';
            if (!body.metrics[key]) {
              // A missing toggle metric is false by default. No need
              // to store it in the DB as false as that just wastes space.
              // eslint-disable-next-line no-param-reassign
              delete body.metrics[key];
            }
            break;
          case 'count':
            // eslint-disable-next-line no-param-reassign
            body.metrics[key] = parseInt(body.metrics[key], 10);
            break;
          case 'length':
            if (body.metrics[key].includes(' ')) {
              const parts = body.metrics[key].split(' ');
              // eslint-disable-next-line no-param-reassign
              body.metrics[key] = (parseFloat(parts[0]) * 12) + parseFloat(parts[1]);
            } else {
              // eslint-disable-next-line no-param-reassign
              body.metrics[key] = parseFloat(body.metrics[key]);
            }
            break;
          case 'weight':
            // eslint-disable-next-line no-param-reassign
            body.metrics[key] = parseFloat(body.metrics[key]);
            break;
          default:
            throw new Error(`Unknown metric type ${metaMetric.type}`);
        }
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(body.metrics[key])) {
          // eslint-disable-next-line no-param-reassign
          delete body.metrics[key];
        }
      } else {
        // Remove any keys that we don't know about
        // eslint-disable-next-line no-param-reassign
        delete body.metrics[key];
      }
    });
    // If all the props in body.metrics have been removed then
    // remove the body.metrics prop.
    if (!Object.keys(body.metrics).length) {
      // eslint-disable-next-line no-param-reassign
      delete body.metrics;
    }
  }

  return body;
}

/**
 * Given a key returns the metaMetric
 * @param key - the key (metric e.g. 'height' or 'blossomStart')
 * @returns - the metaMetric for that key
 */
function metaMetricsGetByKey(key: string): MetaMetric | undefined {
  return metaMetrics.find((value) => value.key === key);
}

/**
 * Determines if unfinished features should be shown. i.e. Feature Flag
 * @param user - a user object - possibly falsy
 * @return - true to show flag and false otherwise
 */
function showFeature(user: { _id: string }): boolean {
  const validUserIds = [
    '57b4e90d9f0e4e114b44bcf8', // Guy
  ];

  return !!(user && user._id && validUserIds.includes(user._id));
}

/**
 * Compares two strings in constant time to prevent a timing attack.
 * @param userSuppliedValue - the value supplied by the user
 * @param internalValue - internal value we compare against
 */
function constantEquals(userSuppliedValue: string | undefined, internalValue: string): boolean {
  if (typeof userSuppliedValue !== 'string' || typeof internalValue !== 'string') {
    return false;
  }
  if (userSuppliedValue.length !== internalValue.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < userSuppliedValue.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    mismatch |= (userSuppliedValue.charCodeAt(i) ^ internalValue.charCodeAt(i));
  }
  return !mismatch;
}

const getNavigatorLanguage = (): string | string[] => {
  const defaultLanguage = 'en';
  try {
    if (!navigator) {
      return defaultLanguage;
    }

    if (navigator.languages && navigator.languages.length) {
      return navigator.languages as string[];
    }

    return navigator.language || defaultLanguage;
  } catch {
    return defaultLanguage;
  }
};

const formatNumber = (value: number, isCurrency: boolean, locale?: string | string[]): string => {
  const style = isCurrency ? 'currency' : 'decimal';
  const locales = locale ?? getNavigatorLanguage();

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    style,
    useGrouping: true,
  };
  if (isCurrency) {
    options.currency = 'USD';
  }
  return new Intl.NumberFormat(locales, options).format(value);
};

const formatPrice = (price?: string | number): string => {
  if (typeof price === 'string') {
    if (price.length === 0) {
      return '';
    }
    const value = parseFloat(price);
    return formatNumber(value, true);
  }
  if (typeof price === 'number') {
    return formatNumber(price, true);
  }
  return '';
};

const utils = {
  constantEquals,
  dateToInt,
  filterPlants,
  filterSortPlants,
  formatNumber,
  formatPrice,
  getCurrentGeoPosition,
  getGlobalThis,
  hasGeo,
  intToDate,
  intToMoment,
  intToString,
  makeDashDate,
  makeLayoutUrl,
  makeLocationUrl,
  makeMongoId,
  makeMongoIdObject,
  makePlantUrl,
  makeSlug,
  metaMetrics,
  metaMetricsGetByKey,
  noteFromBody,
  plantFromBody,
  plantStats,
  rebaseLocations,
  showFeature,
  sortNotes,
  sortPlants,
  transformErrors,
};

export default utils;

// TODO: Move this file to a /shared/ folder.
