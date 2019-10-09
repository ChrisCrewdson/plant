/*
Collection Schemas
These are used in:
db.createCollection('plant', {
  validator: {
    $jsonSchema: {...}
  }
});
*/

import { CollectionCreateOptions } from 'mongodb';

// bsonType's are here: https://docs.mongodb.com/manual/reference/bson-types/

const loc: object = {
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

const plantSchema: object = {
  bsonType: 'object',
  required: ['title', 'userId', 'locationId', '_id'],
  // TODO: Work out how to add the following property
  // additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    title: {
      bsonType: 'string',
      description: 'must be a string and is required',
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

const locationSchema: object = {
  bsonType: 'object',
  required: ['title', 'createdBy', 'members', '_id'],
  additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    title: {
      bsonType: 'string',
      description: 'must be a string and is required',
    },
    members: {
      bsonType: 'object',
      description: 'must be an object and is required',
    },
    stations: {
      bsonType: 'object',
      description: 'must be an object and is not required',
    },
    createdBy: {
      bsonType: ['objectId'],
      description: 'the id of the user that created this document and is required',
    },
    loc,
  },
};

const metrics: object = {
  bsonType: 'object',
  properties: {
    height: {
      bsonType: 'double',
      description: 'must be a double and is not required',
    },
    girth: {
      bsonType: 'double',
      description: 'must be a double and is not required',
    },
    harvestCount: {
      bsonType: 'int',
      description: 'must be an int and is not required',
    },
    harvestWeight: {
      bsonType: 'double',
      description: 'must be a double and is not required',
    },
    leafShedEnd: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    leafShedStart: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    harvestEnd: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    harvestStart: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    firstBlossom: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    lastBlossom: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
    firstBud: {
      bsonType: 'bool',
      description: 'must be a bool and is not required',
    },
  },
};

const noteSchema: object = {
  bsonType: 'object',
  required: ['date', 'plantIds', 'userId', '_id'],
  // additionalProperties: false,
  properties: {
    _id: {
      bsonType: 'objectId',
    },
    date: {
      bsonType: 'int',
      maximum: 30201231, // YYYYMMDD
      description: 'must be an integer before the year 3020 and is required',
    },
    note: {
      bsonType: 'string',
      description: 'must be a string and is not required',
    },
    plantIds: {
      bsonType: 'array',
      description: 'must be an array and is required and must have at least one element and the elements must be of type objectId',
    },
    images: {
      bsonType: 'array',
      description: 'must be an array and is not required and must be of type Image',
    },
    userId: {
      bsonType: ['objectId'],
      description: 'the id of the user that created this document and is required',
    },
    metrics,
  },
};

const getCreateOptions = ($jsonSchema: object): CollectionCreateOptions => ({
  validator: {
    $jsonSchema,
  },
});

export const location = getCreateOptions(locationSchema);
export const note = getCreateOptions(noteSchema);
export const plant = getCreateOptions(plantSchema);
