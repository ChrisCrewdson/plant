const _ = require('lodash');

const logger = require('../../logging/logger').create('mongo-delete');

module.exports = async (db, collection, query) => {
  const coll = db.collection(collection);
  logger.trace('deleteMany:', collection, query);
  const results = await coll.deleteMany(query);
  logger.trace('deleteMany results', { results: _.omit(results, ['connection', 'message']) });
  // results if query item was found:
  //
  // { result: { ok: 1, n: 3 }, deletedCount: 3
  //
  // result if query item was not found:
  //
  // { result: { ok: 1, n: 0 }, deletedCount: 0
  return results && results.deletedCount;
};

