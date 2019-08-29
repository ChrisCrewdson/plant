import { Db } from 'mongodb';

export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const read = async (db: Db, collection: DbCollectionName,
  query: object, options: object): Promise<DbShapes | null> => {
  const coll = db.collection(collection);
  // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find
  const result = await coll.find(query, options).toArray();
  return result && result.length === 0
    ? null
    : result;
};


const readUser = async (db: Db, query: object, options: object):
 Promise<DbUser[] | null> => read(db, 'user', query, options) as Promise<DbUser[]|null>;

/**
 * Reads the user records based on the query but restricts the result set to
 * _id, name, createdAt
 */
const readUserTiny = async (db: Db, query: object): Promise<DbUserTiny[] | null> => {
  const options = {
    projection: { _id: 1, name: 1, createdAt: 1 },
  };

  return read(db, 'user', query, options) as Promise<DbUserTiny[]|null>;
};

const readLocation = async (db: Db, query: object, options: object):
Promise<DbLocation[] | null> => read(db, 'location', query, options) as Promise<DbLocation[]|null>;


const readPlant = async (db: Db, query: object, options: object): Promise<DbPlant[] | null> => read(db, 'plant', query, options) as Promise<DbPlant[]|null>;

const readNote = async (db: Db, query: object, options: object): Promise<DbNote[] | null> => read(db, 'note', query, options) as Promise<DbNote[]|null>;

module.exports = {
  readLocation,
  readNote,
  readPlant,
  readUser,
  readUserTiny,
  readByCollection: read,
};
