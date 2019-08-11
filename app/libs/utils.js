const slug = require('slugify');
const isDate = require('lodash/isDate');
const isNumber = require('lodash/isNumber');
const moment = require('moment');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;

const bson = require('bson');
const constants = require('./constants');

const { gisMultiplier } = constants;
const { ObjectID } = bson;

function makeMongoId() {
  return new ObjectID().toString();
}

/**
 * @returns {import('mongodb').ObjectID}
 */
function makeMongoIdObject() {
  return new ObjectID();
}

/**
 * Make a slug from text
 * @param {string} text
 * @returns {string}
 */
function makeSlug(text) {
  if (!text) {
    // console.warn('text is falsy in makeSlug:', text);
    return '';
  }

  const lower = text.toString().toLowerCase();
  // @ts-ignore - looks like the type definition in this module is messed up
  return slug(lower.replace(/[/()]/g, ' '));
}

/**
 * Make a url with a trailing id
 * @param {string} first - first part of path
 * @param {object} options
 * @param {string} options.title
 * @param {string} options._id
 * @returns {string}
 */
function makeUrl(first, { title, _id }) {
  return `/${first}/${makeSlug(title)}/${_id}`;
}

/**
 * Make a /location/location-name-slug/id url from location object
 * @param {object} location - an Object
 * @param {string} location.title
 * @param {string} location._id
 * @returns {string} - a url
 */
function makeLocationUrl(location) {
  return makeUrl('location', location);
}

/**
 * Make a /location/location-name-slug/id url from location object
 * @param {object} location - an Object
 * @param {string} location.title
 * @param {string} location._id
 * @returns {string} - a url
 */
function makeLayoutUrl(location) {
  return makeUrl('layout', location);
}

/**
 * Convert a date like object to an Integer
 * @param {import('moment').Moment|Date|string|number|undefined} date
 * @returns {number} - a date in the form YYYYMMDD
 */
function dateToInt(date) {
  if (moment.isMoment(date)) {
    return dateToInt(date.toDate());
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
 * @param {number} date
 * @returns {Date}
 */
function intToDate(date) {
  const year = Math.round(date / 10000);
  const month = Math.round((date - (year * 10000)) / 100);
  const day = Math.round((date - ((year * 10000) + (month * 100))));
  return new Date(year, month - 1, day);
}

/**
 * Convert number to a Moment object
 * @param {number} date
 * @returns {import('moment').Moment}
 */
function intToMoment(date) {
  return moment(intToDate(date));
}

/**
 * Convert number date to string date
 * @param {number} date
 * @returns {string}
 */
function intToString(date) {
  return intToMoment(date).format('MM/DD/YYYY');
}

/**
 * Converts the body of a POST/PUT to a plant object.
 * @param {object} body - POST/PUT body
 * @returns {object} - body with relevant fields converted to correct data type
 */
function plantFromBody(body) {
  const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
  dateFields.forEach((dateField) => {
    if (body[dateField]) {
      // eslint-disable-next-line no-param-reassign
      body[dateField] = parseInt(body[dateField], 10);
    }
  });
  if (typeof body.isTerminated === 'string') {
    // eslint-disable-next-line no-param-reassign
    body.isTerminated = body.isTerminated === 'true';
  }
  return body;
}

/**
 * Filters the plantIds array based on filter
 * @param {string[]} plantIds - original plantIds to filter
 * @param {object} plants - all the plants available to sort
 * @param {string=} filter - optional text to filter title of plant
 * @returns {array} - an array of filtered plantIds
 */
function filterPlants(plantIds, plants, filter) {
  const lowerFilter = (filter || '').toLowerCase();
  return lowerFilter
    ? plantIds.filter((plantId) => {
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
 * @param {string} prop - the property in the object to sort by
 * @param {string[]} itemIds - an array of Ids
 * @param {object} items - a object that has ids as props
 * @returns {boolean} - true if already sorted otherwise false
 */
function alreadySorted(prop, itemIds, items) {
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
 * @param {string} prop - the name of the property from the items object that's being sorted
 * @param {string[]} itemIds - array of MongoId strings
 * @param {object} items - an object with MongoIds as keys. The values are objects.
 * @returns {array} - an immutable array of sorted itemIds
 */
function sortItems(prop, itemIds, items) {
  // TODO: Memoize this method.
  if (!itemIds || !itemIds.length) {
    return itemIds || [];
  }

  if (alreadySorted(prop, itemIds, items)) {
    return itemIds;
  }

  /**
   * Sort method
   * @param {string} a
   * @param {string} b
   */
  const sorter = (a, b) => {
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

  return seamless.from(seamless.asMutable(itemIds).sort(sorter));
}

/**
 * Sort the noteIds based on the date property.
 * @param {string[]} noteIds - array of MongoId strings
 * @param {object} notes - an object with MongoIds as keys. The values are note objects.
 * @returns {string[]} - an immutable array of sorted noteIds
 */
function sortNotes(noteIds, notes) {
  // TODO: Memoize this method
  return sortItems('date', noteIds, notes);
}

/**
 * Sorts the plantIds based on the plant's title
 * @param {string[]} plantIds - original plantIds to filter
 * @param {object} plants - all the plants available to sort
 * @returns {string[]} - an immutable array of sorted plantIds
 */
function sortPlants(plantIds, plants) {
  // TODO: Memoize this method
  return sortItems('title', plantIds, plants);
}

/**
 * Filters the plantIds array and sorts based on the plant's title
 * @param {string[]} plantIds - original plantIds to filter
 * @param {object} plants - all the plants available to sort
 * @param {string} filter - optional text to filter title of plant
 * @returns {string[]} - an array of sorted and filtered plantIds
 */
function filterSortPlants(plantIds, plants, filter) {
  const filteredPlantIds = filterPlants(plantIds, plants, filter);

  return sortPlants(filteredPlantIds, plants);
}

/**
 * Plant stats
 * @param {string[]} plantIds
 * @param {object} plants
 */
function plantStats(plantIds, plants) {
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
 * @param {Dictionary<string[]>=} errors - values are arrays
 * @returns {Dictionary<string>|undefined} - first element of value for each key
 */
function transformErrors(errors) {
  if (!errors) {
    return errors;
  }
  return Object.keys(errors).reduce(
    /**
     * @param {Dictionary<string>} acc
     * @param {string} key
     */
    (acc, key) => {
      // Assign first element of errors[key] (which is an array) to acc[key]
      [acc[key]] = errors[key];
      return acc;
    }, /** @type {Dictionary<string>} */ ({}));
}

/**
 * Tests to see if JS runtime (window) supports Geo Location
 * @returns {boolean}
 */
function hasGeo() {
  return !!(window && window.navigator && window.navigator.geolocation);
}

/**
 * Gets the current geo location
 * @param {PositionOptions} optionsParam
 * @param {GeoCallback} cb
 * @returns {void}
 */
function getGeo(optionsParam, cb) {
  if (!hasGeo()) {
    return cb(new Error('This device does not have geolocation available'));
  }

  /** @type {PositionOptions} */
  const options = {
    enableHighAccuracy: true,
    timeout: 30000, // 30 seconds
    ...optionsParam,
  };

  return window.navigator.geolocation.getCurrentPosition(
    (position) => {
    // { type: "Point", coordinates: [ 40, 5 ] }
    // position: {coords: {latitude: 11.1, longitude: 22.2}}
      /** @type {Geo} */
      const geoJson = {
        type: 'Point',
        coordinates: [
          position.coords.longitude,
          position.coords.latitude,
        ],
      };
      return cb(null, geoJson);
    }, (err) => {
      cb(err);
    }, options);
}


/**
 * Because math in JS is not precise we need to use integers
 * to subtract 2 number for GIS rebasing
 * @param {number} left - the left number in the operation
 * @param {number} right - the right number in the operation
 * @returns {number} - left - right
 */
function subtractGis(left, right) {
  // 7 decimal places in long/lat will get us down to 11mm which
  // is good for surveying which is what we're basically doing here
  return Math.round((left * gisMultiplier) - (right * gisMultiplier)) / gisMultiplier;
}

/**
 * @param {BizPlant} plant
 * @returns {number[]|boolean}
 */
const getLongLat = (plant) => {
  const long = plant.loc && plant.loc.coordinates && plant.loc.coordinates[0];
  const lat = plant.loc && plant.loc.coordinates && plant.loc.coordinates[1];
  if (isNumber(long) && isNumber(lat)) {
    return [long, lat];
  }
  return false;
};

/**
 * Rebase the long and lat of the plant locations
 * @param {BizPlant[]} plants - an array of plants with just the _id and loc fields
 * @returns {BizPlant[]} - same array of plants with the locations rebased to 0,0
 */
function rebaseLocations(plants) {
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

/** @type {MetaMetric[]} */
const metaMetricsRaw = [{
  key: 'height',
  label: 'Height (inches only)', // For InputCombo
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

/** @type {MetaMetric[]} */
const metaMetrics = seamless.from(metaMetricsRaw);

/**
 * Converts the body from a POST (Upsert) operation from a client into a BizNote
 * @param {any} body
 * @returns {BizNote}
 */
function noteFromBody(body) {
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
 * @param {string} key - the key (metric e.g. 'height' or 'blossomStart')
 * @returns {MetaMetric|undefined} - the metaMetric for that key
 */
function metaMetricsGetByKey(key) {
  return metaMetrics.find((value) => value.key === key);
}

/**
 * Determines if unfinished features should be shown. i.e. Feature Flag
 * @param {object} user - a user object - possibly falsy
 * @return {boolean} - true to show flag and false otherwise
 */
function showFeature(user) {
  const validUserIds = [
    '57b4e90d9f0e4e114b44bcf8', // Guy
  ];

  return !!(user && user._id && validUserIds.indexOf(user._id) > -1);
}

/**
 * Compares two strings in constant time to prevent a timing attack.
 * @param {string=} userSuppliedValue - the value supplied by the user
 * @param {string} internalValue - internal value we compare against
 */
function constantEquals(userSuppliedValue, internalValue) {
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

module.exports = {
  constantEquals,
  dateToInt,
  filterPlants,
  filterSortPlants,
  getGeo,
  hasGeo,
  intToDate,
  intToMoment,
  intToString,
  makeLayoutUrl,
  makeLocationUrl,
  makeMongoId,
  makeMongoIdObject,
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

// TODO: Move this file to a /shared/ folder.
