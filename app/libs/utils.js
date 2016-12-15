const constants = require('./constants');
const slug = require('slug');
const isDate = require('lodash/isDate');
const moment = require('moment');
const Immutable = require('immutable');

const {gisMultiplier} = constants;

// bson is currently not being explicitly installed in the project because
// mongodb depends on mongodb-core which depends on bson. The Npm 3 installer
// will therefore install bson as a top level dependency in node_modules. If
// this pattern is changed then we would need to install npm independently.
// Requiring only bson here achieves 2 things:
// 1. Fixes a problem that Webpack has when bundling this module and chaining
//    from mongodb down to bson and,
// 2. Reduces the size of the bundle that gets generated for the browser.
const bson = require('bson');
const {ObjectID} = bson;

function makeMongoId() {
  return new ObjectID().toString();
}

function makeSlug(text) {
  if(!text) {
    console.warn('text is falsey in makeSlug:', text);
    return '';
  }

  text = text.toString();
  text = text.replace(/\//g, ' ');
  return slug(text.toString(), {
    // replacement: '-',
    // symbols: true,
    // remove: /[.]/g,
    lower: true,
    // charmap: slug.charmap,
    // multicharmap: slug.multicharmap
  });
}

function makeUrl(first, location) {
  const title = location.get('title');
  const _id = location.get('_id');

  return `/${first}/${makeSlug(title)}/${_id}`;
}

/**
 * Make a /location/location-name-slug/id url from location object
 * @param {Immutable.Map} location - an Immutable.js Map
 * @returns {string} - a url
 */
function makeLocationUrl(location) {
  return makeUrl('location', location);
}

function makeLayoutUrl(location) {
  return makeUrl('layout', location);
}

/**
 * Convert a date like object to an Integer
 * @param {object} date - could be object, string or Integer
 * @returns {Integer} - a date in the form YYYYMMDD
 */
function dateToInt(date) {
  if(moment.isMoment(date)) {
    return dateToInt(date.toDate());
  } else if(isDate(date)) {
    return date.getFullYear() * 10000 +
      (date.getMonth() + 1) * 100 +
      date.getDate();
  } else if (typeof date === 'string') {
    return dateToInt(new Date(date));
  } else if (typeof date === 'number') {
    return date;
  } else {
    console.error('Unable to convert in dateToInt:', date);
    throw new Error(`dateToInt(${date})`);
  }
}

function intToDate(date) {
  const year = Math.round(date / 10000);
  const month = Math.round( (date - year * 10000) / 100);
  const day = Math.round( (date - (year * 10000 + month * 100)));
  return new Date(year, month - 1, day);
}

function intToMoment(date) {
  return moment(intToDate(date));
}

function intToString(date) {
  return intToMoment(date).format('MM/DD/YYYY');
}

/**
 * Converts the body of a POST/PUT to a plant object.
 * @param {object} body - POST/PUT body
 * @returns {object} - body with relavant fields converted to correct data type
 */
function plantFromBody(body) {
  const dateFields = ['plantedDate', 'purchasedDate', 'terminatedDate'];
  dateFields.forEach(dateField => {
    if(body[dateField]) {
      body[dateField] = parseInt(body[dateField], 10);
    }
  });
  if(typeof body.isTerminated === 'string') {
    body.isTerminated = body.isTerminated === 'true';
  }
  return body;
}

/**
 * Filters the plantIds array based on filter
 * @param {array} plantIds - original plantIds to filter
 * @param {Immutable.Map} plants - all the plants available to sort
 * @param {string} filter - optional text to filter title of plant
 * @returns {array} - an array of filtered plantIds
 */
function filterPlants(plantIds, plants, filter) {
  return filter
    ? plantIds.filter(plantId => {
      const plant = plants.get(plantId);
      return !plant || (plant.get('title') || '').toLowerCase().indexOf(filter) >= 0;
    })
    : plantIds;
}

/**
 * Sorts the plantIds based on the plant's title
 * @param {array} plantIds - original plantIds to filter
 * @param {Immutable.Map} plants - all the plants available to sort
 * @returns {array} - an array of sorted plantIds
 */
function sortPlants(plantIds, plants) {
  return plantIds.sort((a, b) => {
    const plantA = plants.get(a);
    const plantB = plants.get(b);
    if(plantA && plantB) {
      if(plantA.get('title') === plantB.get('title')) {
        return 0;
      }
      return plantA.get('title') > plantB.get('title') ? 1 : -1;
    } else {
      return 0;
    }
  });
}

/**
 * Filters the plantIds array and sorts based on the plant's title
 * @param {array} plantIds - original plantIds to filter
 * @param {Immutable.Map} plants - all the plants available to sort
 * @param {string} filter - optional text to filter title of plant
 * @returns {array} - an array of sorted and filtered plantIds
 */
function filterSortPlants(plantIds, plants, filter) {
  const filteredPlantIds = filterPlants(plantIds, plants, filter);

  return sortPlants(filteredPlantIds, plants);
}

/**
 * The values of the errors object are arrays. Take the first item out of each array.
 * @param {object} errors - values are arrays
 * @returns {object} - first element of value for each key
 */
function transformErrors(errors) {
  if(!errors) {
    return errors;
  }
  return Object.keys(errors).reduce((acc, key) => {
    acc[key] = errors[key][0];
    return acc;
  }, {});
}

function hasGeo() {
  return !!(navigator && navigator.geolocation);
}

function getGeo(options, cb) {
  if(!hasGeo()) {
    return cb('This device does not have geolcation available');
  }

  options = Object.assign({}, {
    enableHighAccuracy: true,
    timeout: 30000, // 10 seconds
  }, options);

  navigator.geolocation.getCurrentPosition(position => {
    // { type: "Point", coordinates: [ 40, 5 ] }
    // postion: {coords: {latitude: 11.1, longitude: 22.2}}
    const geoJson = {
      type: 'Point',
      coordinates: [
        position.coords.longitude,
        position.coords.latitude,
      ]
    };
    return cb(null, geoJson);
  }, positionError => {
    console.error('geolcation error:', positionError);
    return cb('There was an error get the geo position', positionError);
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
  return Math.round(left * gisMultiplier - right * gisMultiplier) / gisMultiplier;
}

/**
 * Rebase the long and lat of the plant locations
 * @param {array} plants - an array of plants with just the _id and loc fields
 * @returns {array} - same array of plants with the locations rebased to 0,0
 */
function rebaseLocations(plants) {
  if(!plants || !plants.length) {
    return plants;
  }

  const northWestPoints = plants.reduce((acc, plant) => {
    const [long, lat] = plant.loc.coordinates;
    acc.long = Math.min(acc.long, long);
    acc.lat = Math.min(acc.lat, lat);
    return acc;
  }, {long: 180, lat: 90});

  return plants.map(plant => {
    return {
      _id: plant._id.toString(),
      loc: {
        coordinates: [
          subtractGis(plant.loc.coordinates[0], northWestPoints.long),
          subtractGis(plant.loc.coordinates[1], northWestPoints.lat),
        ]
      }
    };
  });
}

const metaMetrics = Immutable.fromJS([{
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
},
]);

function noteFromBody(body) {
  body.date = parseInt(body.date, 10);

  if(body.metrics) {
    Object.keys(body.metrics).forEach(key => {
      const metaMetric = metaMetrics.find(mm => mm.get('key') === key);
      if(metaMetric) {
        switch(metaMetric.get('type')) {
          case 'toggle':
            body.metrics[key] = body.metrics[key] === 'true';
            if(!body.metrics[key]) {
              // A missing toggle metric is false by default. No need
              // to store it in the DB as false as that just wastes space.
              delete body.metrics[key];
            }
            break;
          case 'count':
            body.metrics[key] = parseInt(body.metrics[key], 10);
            break;
          case 'length':
            if(body.metrics[key].includes(' ')) {
              const parts = body.metrics[key].split(' ');
              body.metrics[key] = parseFloat(parts[0], 10) * 12 + parseFloat(parts[1], 10);
            } else {
              body.metrics[key] = parseFloat(body.metrics[key], 10);
            }
            break;
          default:
            body.metrics[key] = parseFloat(body.metrics[key], 10);
            break;
        }
        if(isNaN(body.metrics[key])) {
          delete body.metrics[key];
        }
      } else {
        // Remove any keys that we don't know about
        delete body.metrics[key];
      }
    });
    // If all the props in body.metrics have been removed then
    // remove the body.metrics prop.
    if(!Object.keys(body.metrics).length) {
      delete body.metrics;
    }
  }

  return body;
}

/**
 * Given a key returns the metaMetric
 * @param {string} key - the key (metric e.g. 'height' or 'blossomStart')
 * @returns {Immutable} - the metaMetric for that key
 */
function metaMetricsGetByKey(key) {
  return metaMetrics.find(value => value.get('key') === key);
}

/**
 * Determines if unfinished features should be shown. i.e. Feature Flag
 * @param {Immutable} user - an Immutable user object - possibly falsey
 * @return {boolean} - true to show flag and false otherwise
 */
function showFeature(user) {
  const validUserIds = [
    '57b4e90d9f0e4e114b44bcf8', // Guy
  ];

  return !!(user && user.get && validUserIds.indexOf(user.get('_id')) > -1);
}

module.exports = {
  dateToInt,
  filterPlants,
  filterSortPlants,
  getGeo,
  hasGeo,
  intToDate,
  intToMoment,
  intToString,
  makeLayoutUrl,
  makeMongoId,
  makeLocationUrl,
  makeSlug,
  metaMetrics,
  metaMetricsGetByKey,
  noteFromBody,
  plantFromBody,
  rebaseLocations,
  showFeature,
  sortPlants,
  transformErrors,
};

// TODO: Move this file to a /shared/ folder.
