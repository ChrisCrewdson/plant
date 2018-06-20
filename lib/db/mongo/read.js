
module.exports = async (db, collection, query, fields, options) => {
  const coll = db.collection(collection);
  const result = await coll.find(query, fields, options).toArray();
  return result && result.length === 0
    ? null
    : result;
};
