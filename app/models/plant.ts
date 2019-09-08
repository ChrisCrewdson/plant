export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const cloneDeep = require('lodash/cloneDeep');
const trim = require('lodash/trim');
const validatejs = require('validate.js');
const { makeMongoId } = require('../libs/utils');
const constants = require('../libs/constants');
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

const floatParser = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  return parseFloat(value);
};

/**
 * Intentionally mutates object
 * Transform:
 * 1. Lowercase elements of array
 * 2. Apply unique to array which might reduce length of array
 */
function transform(attributes: UiPlantsValue): UiPlantsValue {
  if (attributes.price === '') {
    // eslint-disable-next-line no-param-reassign
    delete attributes.price;
  }

  // If any amounts are preceded by a $ sign then trim that.
  if (attributes.price && typeof attributes.price === 'string') {
    // eslint-disable-next-line no-param-reassign
    attributes.price = parseFloat(trim(attributes.price, '$'));
  }

  if (attributes.loc) {
    // eslint-disable-next-line no-param-reassign
    attributes.loc.coordinates[0] = floatParser(attributes.loc.coordinates[0]);
    // eslint-disable-next-line no-param-reassign
    attributes.loc.coordinates[1] = floatParser(attributes.loc.coordinates[1]);
  }

  return attributes;
}

interface ValidateOptions {
  isNew: boolean;
}

/**
 * Don't need an _id if we're creating a document, db will do this.
 * Don't need a userId if we're in the client, this will get added on the server
 * to prevent tampering with the logged in user.
 */
module.exports = (attributes: UiPlantsValue, { isNew }: ValidateOptions): UiPlantsValue => {
  const constraints = {
    _id: { format: constants.mongoIdRE, presence: true },
    botanicalName: { length: { maximum: 100 } },
    commonName: { length: { maximum: 100 } },
    description: { length: { maximum: 2500 } },
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
    attributes = { ...attributes, _id: makeMongoId() };
  }

  /** @type {UiPlantsValue} */
  const cleaned: UiPlantsValue = validatejs.cleanAttributes(cloneDeep(attributes), constraints);
  const transformed = transform(cleaned);
  const errors = validatejs.validate(transformed, constraints);
  const flatErrors = utils.transformErrors(errors);
  if (flatErrors) {
    throw flatErrors;
  }
  return transformed;
};
