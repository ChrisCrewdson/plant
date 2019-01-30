
/**
   * Query a collection
   * @param {import('mongodb').Db} db
   * @param {DbCollectionName} collection
   * @param {object} query
   * @param {object} options
   * @returns {Promise}
   */
const read = async (db, collection, query, options) => {
  const coll = db.collection(collection);
  // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find
  const result = await coll.find(query, options).toArray();
  return result && result.length === 0
    ? null
    : result;
};

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbUser[]>}
 */
const readUser = async (db, query, options) => read(db, 'user', query, options);

/**
 * Reads the user records based on the query but restricts the result set to
 * _id, name, createdAt
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @returns {Promise<DbUserTiny[]>}
 */
const readUserTiny = async (db, query) => {
  const options = {
    projection: { _id: 1, name: 1, createdAt: 1 },
  };

  return read(db, 'user', query, options);
};

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbLocation[]>}
 */
const readLocation = async (db, query, options) => read(db, 'location', query, options);

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbPlant[]>}
 */
const readPlant = async (db, query, options) => read(db, 'plant', query, options);

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbNote[]>}
 */
const readNote = async (db, query, options) => read(db, 'note', query, options);

module.exports = {
  readLocation,
  readNote,
  readPlant,
  readUser,
  readUserTiny,
  readByCollection: read,
};
