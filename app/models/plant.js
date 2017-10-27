const cloneDeep = require('lodash/cloneDeep');
const trim = require('lodash/trim');
const isArray = require('lodash/isArray');
const uniq = require('lodash/uniq');
const every = require('lodash/every');
const { makeMongoId } = require('../libs/utils');
const constants = require('../libs/constants');
const validatejs = require('validate.js');
const utils = require('../libs/utils');

//  The validator receives the following arguments:
//     value - The value exactly how it looks in the attribute object.
//     options - The options for the validator. Guaranteed to not be null or undefined.
//     key - The attribute name.
//     attributes - The entire attributes object.
//     globalOptions - The options passed when calling validate
//                     (will always be an object, non null).
//
// If the validator passes simply return null or undefined. Otherwise return a string or an array
// of strings containing the error message(s).
// Make sure not to append the key name, this will be done automatically.
validatejs.validators.tagValidate = (value /* , options, key, attributes */) => {
  // tags array rules:
  // 1. lowercase alpha and -
  const validRegex = /^[a-z-]*$/;
  // 2. unique array of strings
  // 3. max length of array: 5
  const maxTags = 5;
  // 4. max length of each string: 20
  const maxTagLength = 20;
  // 5. optional

  if (!value) {
    return null;
  }

  if (!isArray(value)) {
    return 'must be an array';
  }

  if (maxTags && value.length > maxTags) {
    return `can have a maximum of ${maxTags} tags`;
  }

  if (maxTagLength && value.length > 0) {
    const maxlen = value.reduce((prev, item) => Math.max(prev, item.length), 0);
    if (maxlen > maxTagLength) {
      return `cannot be more than ${maxTagLength} characters`;
    }
  }

  // Only a to z and '-'
  if (!every(value, item => validRegex.test(item))) {
    return 'can only have alphabetic characters and a dash';
  }

  return null;
};

// Intentionally mutates object
// Transform:
// 1. Lowercase elements of array
// 2. Apply unique to array which might reduce length of array
function transform(attributes) {
  if (attributes.tags && isArray(attributes.tags)) {
    // eslint-disable-next-line no-param-reassign
    attributes.tags = uniq(attributes.tags.map(tag => tag.toLowerCase()));
  }

  // If any amounts are preceded by a $ sign then trim that.
  if (attributes.price && typeof attributes.price === 'string') {
    // eslint-disable-next-line no-param-reassign
    attributes.price = parseFloat(trim(attributes.price, '$'), 10);
  }

  if (attributes.loc) {
    // eslint-disable-next-line no-param-reassign
    attributes.loc.coordinates[0] = parseFloat(attributes.loc.coordinates[0], 10);
    // eslint-disable-next-line no-param-reassign
    attributes.loc.coordinates[1] = parseFloat(attributes.loc.coordinates[1], 10);
  }

  return attributes;
}

// Don't need an _id if we're creating a document, db will do this.
// Don't need a userId if we're in the client, this will get added on the server
// to prevent tampering with the logged in user.
module.exports = (attributes, { isNew }) => {
  const constraints = {
    _id: { format: constants.mongoIdRE, presence: true },
    botanicalName: { length: { maximum: 100 } },
    commonName: { length: { maximum: 100 } },
    description: { length: { maximum: 500 } },
    // { type: "Point", coordinates: [ 40, 5 ] }
    loc: { presence: false },
    'loc.type': { presence: false }, // if loc is present then this must be present and be "Point"
    // if loc is present then the next 2 must be present
    // See issue #1403 - the follow turn the array into an object in cleanAttributes()
    'loc.coordinates.0': { numericality: { noStrings: true } },
    'loc.coordinates.1': { numericality: { noStrings: true } },
    plantedDate: { intDateValidate: { presence: false, name: 'Planted date' } },
    price: { numericality: { noStrings: true } },
    purchasedDate: { intDateValidate: { presence: false, name: 'Acquire date' } },
    tags: { tagValidate: {} },
    isTerminated: { presence: false },
    terminatedDate: { intDateValidate: { presence: false, name: 'Terminated date' } },
    terminatedReason: { presence: false },
    terminatedDescription: { presence: false },
    title: { length: { minimum: 1, maximum: 100 }, presence: true },
    userId: { format: constants.mongoIdRE, presence: true },
    locationId: { format: constants.mongoIdRE, presence: true },
  };

  if (isNew && !attributes._id) {
    // eslint-disable-next-line no-param-reassign
    attributes = Object.assign({}, attributes, { _id: makeMongoId() });
  }

  // debug('attributes:', attributes);
  const cleaned = validatejs.cleanAttributes(cloneDeep(attributes), constraints);
  // debug('cleaned:', cleaned);
  const transformed = transform(cleaned);
  // debug('transformed:', transformed);
  const errors = validatejs.validate(transformed, constraints);
  // debug('errors:', errors);
  const flatErrors = utils.transformErrors(errors);
  if (flatErrors) {
    throw flatErrors;
  }
  return transformed;
};
