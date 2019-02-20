/*
Collection Schemas
These are used in:
db.createCollection('plant', {
  validator: {
    $jsonSchema: {...}
  }
});
*/

// bsonType's are here: https://docs.mongodb.com/manual/reference/bson-types/

/** @type {object} */
const loc = {
  bsonType: 'object',
  required: ['type', 'coordinates'],
  properties: {
    type: {
      enum: ['Point'],
      description: 'can only be "Point" and is required',
    },
    coordinates: {
      bsonType: 'object',
      required: ['0', '1'],
      properties: {
        0: {
          bsonType: 'double',
          description: 'must be a double and is required',
        },
        1: {
          bsonType: 'double',
          description: 'must be a double and is required',
        },
      },
    },
  },
};

/** @type {object} */
const plantSchema = {
  bsonType: 'object',
  required: ['title', 'userId', 'locationId'],
  properties: {
    title: {
      bsonType: 'string',
      description: 'must be a string and is required',
    },
    gender: {
      bsonType: 'string',
      description: 'must be a string and is not required',
    },
    purchasedDate: {
      bsonType: 'int',
      maximum: 30201231, // YYYYMMDD
      description: 'must be an integer before the year 3020 and is not required',
    },
    plantedDate: {
      bsonType: 'int',
      maximum: 30201231, // YYYYMMDD
      description: 'must be an integer before the year 3020 and is not required',
    },
    userId: {
      bsonType: ['objectId'],
      description: 'the id of the user that created this document and is required',
    },
    locationId: {
      bsonType: ['objectId'],
      description: 'Corresponding _id in the Location collection and is required',
    },
    price: {
      bsonType: 'double',
      description: 'must be a double and is not required',
    },
    terminatedReason: {
      enum: ['died', 'culled', 'transferred', null],
      description: 'can only be one of the enum values and is not required',
    },
    isTerminated: {
      bsonType: 'bool',
      description: 'optional',
    },
    terminatedDescription: {
      bsonType: 'string',
      description: 'must be a string and is not required',
    },
    terminatedDate: {
      bsonType: 'int',
      maximum: 30201231, // YYYYMMDD
      description: 'must be an integer before the year 3020 and is not required',
    },
    loc,
  },
};

/**
 * @param {object} $jsonSchema
 * @returns {import('mongodb').CollectionCreateOptions}
 */
const getCreateOptions = $jsonSchema => ({
  validator: {
    $jsonSchema,
  },
});

const plant = getCreateOptions(plantSchema);

module.exports = {
  plant,
};
