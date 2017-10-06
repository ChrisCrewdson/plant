
const logger = require('../../logging/logger').create('mongo-read');

module.exports = async (db, collection, query, fields, options) => {
  const coll = db.collection(collection);
  const result = await coll.find(query, fields, options).toArray();
  logger.trace('read result:', { collection, query, result });
  return result && result.length === 0
    ? null
    : result;
};
