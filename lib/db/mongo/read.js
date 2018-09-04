
/**
   * Query a collection
   * @param {import('mongodb').Db} db
   * @param {string} collection
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

module.exports = read;
