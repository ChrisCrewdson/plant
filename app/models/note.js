const cloneDeep = require('lodash/cloneDeep');
const omit = require('lodash/omit');
const isArray = require('lodash/isArray');
const every = require('lodash/every');
const validatejs = require('validate.js');
const { makeMongoId } = require('../libs/utils');
const constants = require('../libs/constants');
const utils = require('../libs/utils');

/**
 * This validation rule is used for validating the plantIds on a note. A note can
 * have multiple plants associated with it which is represented by an array of
 * plantIds. The UI allows the addition and removal of plants associated with a note.
 * This rule ensures that there is always at least one plantId that meets the requirements.
 * 1. is present
 * 2. is array
 * 3. min length 1
 * 4. each item is uuid
 * @param {number} value
 * @param {object} options
 * @param {object} options.length
 * @param {number} options.length.minimum
 * @returns {string|null}
 */
validatejs.validators.plantIdsValidate = (value, options /* , key, attributes */) => {
  if (!value) {
    return 'is required';
  }

  if (!isArray(value)) {
    return 'must be an array';
  }

  const minarray = options && options.length && options.length.minimum;
  if (minarray && value.length < minarray) {
    // Leading ^ means don't prepend the variable being validated
    return `^You must select at least ${minarray} plant for this note.`;
  }

  // Only mongoId values of x length
  const validInner = every(value, item => constants.mongoIdRE.test(item));

  if (!validInner) {
    return 'must be MongoIds';
  }

  return null;
};

/**
 * @param {object} attributes
 * @returns
 */
function transform(attributes) {
  return attributes;
}

/**
 * Validate the parts of the images array
 * @param {UploadedNoteFile[]} value
 */
validatejs.validators.imagesValidate = (value) => {
  if (!value) {
    // images is optional so return if not exist
    return null;
  }

  if (!isArray(value)) {
    return 'must be an array';
  }

  // Only uuid values of x length
  const validImageObject = every(value, item => item
      && constants.mongoIdRE.test(item.id)
      && typeof item.ext === 'string'
      && typeof item.originalname === 'string'
      && typeof item.size === 'number'
      && item.ext.length <= 20
      && item.originalname.length <= 500);

  if (!validImageObject) {
    return 'must be valid image objects';
  }

  const allowedProps = ['id', 'ext', 'originalname', 'size', 'sizes'];

  let extraProps = {};
  const validProps = every(value, (item) => {
    // Make sure no extra keys inserted
    extraProps = omit(item, allowedProps);
    return Object.keys(extraProps).length === 0;
  });

  if (!validProps) {
    return `must only have the following allowed props: \
${allowedProps.join()} and in one of the items in the array it found these props as well: \
${Object.keys(extraProps).join()}`;
  }

  // Check the sizes array if there is one
  const names = constants.imageSizeNames;
  const validSizes = every(value, (item) => {
    if (item.sizes && item.sizes.length) {
      return every(item.sizes, size => names.indexOf(size.name) >= 0
          && typeof size.width === 'number');
    }
    return true;
  });

  if (!validSizes) {
    return 'must be valid sizes in the image';
  }

  return null;
};

/**
 * @param {number|string} value
 */
const intParser = (value) => {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  return parseInt(value, 10);
};

/**
 * Don't need an _id if we're creating a document, db will do this.
 * Don't need a userId if we're in the client, this will get added on the server
 * to prevent tampering with the logged in user.
 * @param {UiInterimNote} atts
 * @returns {UiInterimNote}
 */
module.exports = (atts) => {
  const constraints = {
    _id: { format: constants.mongoIdRE, presence: true },
    date: { intDateValidate: { presence: true, name: 'Date' } },
    images: { imagesValidate: {} },
    metrics: { presence: false },
    plantIds: { plantIdsValidate: { length: { minimum: 1 } } },
    note: { length: { minimum: 0, maximum: 5000 }, presence: false },
  };

  let attributes = cloneDeep(atts);
  attributes._id = attributes._id || makeMongoId();

  if (isArray(attributes.images)) {
    const images = attributes.images.map((image) => {
      const sizes = (image.sizes || []).map(({ name, width }) => ({
        name,
        width: intParser(width),
      }));
      const img = Object.assign({}, image, { size: intParser(image.size) });
      if (sizes.length) {
        Object.assign(img, { sizes });
      }
      return img;
    });
    attributes = Object.assign({}, attributes, { images });
  }

  const cleaned = validatejs.cleanAttributes(cloneDeep(attributes), constraints);
  const transformed = transform(cleaned);
  const errors = validatejs.validate(transformed, constraints);
  const flatErrors = utils.transformErrors(errors);
  if (flatErrors) {
    throw flatErrors;
  }
  return transformed;
};
