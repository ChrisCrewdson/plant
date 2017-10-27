const cloneDeep = require('lodash/cloneDeep');
const omit = require('lodash/omit');
const isArray = require('lodash/isArray');
const every = require('lodash/every');
const { makeMongoId } = require('../libs/utils');
const constants = require('../libs/constants');
const validatejs = require('validate.js');
const utils = require('../libs/utils');

validatejs.validators.plantIdsValidate = (value, options /* , key, attributes */) => {
  // plantId array rules:
  // 1. is present
  // 2. is array
  // 3. min length 1
  // 4. each item is uuid

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
  const validInner = every(value, item =>
    item && item.length === 24 && constants.mongoIdRE.test(item));

  if (!validInner) {
    return 'must be MongoIds';
  }

  return null;
};

function transform(attributes) {
  return attributes;
}

// Validate the parts of the images array
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

  let extraProps;
  const validProps = every(value, (item) => {
    // Make sure no extra keys inserted
    extraProps = omit(item, allowedProps);
    return Object.keys(extraProps).length === 0;
  });

  if (!validProps) {
    return `must only have the following allowed props: ${allowedProps.join()} and found these props as well: ${Object.keys(extraProps).join()}`;
  }

  // Check the sizes array if there is one
  const names = constants.imageSizeNames;
  const validSizes = every(value, (item) => {
    if (item.sizes) {
      return every(item.sizes, size => names.indexOf(size.name) >= 0 &&
          typeof size.width === 'number');
    }
    return true;
  });

  if (!validSizes) {
    return 'must be valid sizes in the image';
  }

  return null;
};

// Don't need an _id if we're creating a document, db will do this.
// Don't need a userId if we're in the client, this will get added on the server
// to prevent tampering with the logged in user.
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
        width: parseInt(width, 10),
      }));
      const img = Object.assign({}, image, { size: parseInt(image.size, 10) });
      if (sizes.length) {
        Object.assign(img, { sizes });
      }
      return img;
    });
    attributes = Object.assign({}, attributes, { images });
  }

  // debug('attributes:', attributes);
  const cleaned = validatejs.cleanAttributes(cloneDeep(attributes), constraints);
  // debug('cleaned:', cleaned);
  const transformed = transform(cleaned);
  // debug('transformed:', transformed);
  const errors = validatejs.validate(transformed, constraints);
  const flatErrors = utils.transformErrors(errors);
  if (flatErrors) {
    throw flatErrors;
  }
  return transformed;
};
