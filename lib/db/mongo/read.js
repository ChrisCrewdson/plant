
/**
   * Query a collection
   * @param {import('mongodb').Db} db
   * @param {DbCollectionName} collection
   * @param {object} query
   * @param {object} options
   * @returns {Promise<DbShapes|null>}
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
 * @returns {Promise<DbUser[]|null>}
 */
const readUser = async (db, query, options) => /** @type {Promise<DbUser[]|null>} */ (
  read(db, 'user', query, options)
);

/**
 * Reads the user records based on the query but restricts the result set to
 * _id, name, createdAt
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @returns {Promise<DbUserTiny[]|null>}
 */
const readUserTiny = async (db, query) => {
  const options = {
    projection: { _id: 1, name: 1, createdAt: 1 },
  };

  return /** @type {Promise<DbUserTiny[]|null>} */ (read(db, 'user', query, options));
};

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbLocation[]|null>}
 */
const readLocation = async (db, query, options) => /** @type {Promise<DbLocation[]|null>} */ (read(db, 'location', query, options));

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbPlant[]|null>}
 */
const readPlant = async (db, query, options) => /** @type {Promise<DbPlant[]|null>} */ (read(db, 'plant', query, options));

/**
 * @param {import('mongodb').Db} db
 * @param {object} query
 * @param {object} options
 * @returns {Promise<DbNote[]|null>}
 */
const readNote = async (db, query, options) => /** @type {Promise<DbNote[]|null>} */ (read(db, 'note', query, options));

module.exports = {
  readLocation,
  readNote,
  readPlant,
  readUser,
  readUserTiny,
  readByCollection: read,
};
