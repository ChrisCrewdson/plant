const Helper = require('./helper');
const logger = require('../../logging/logger').create('mongo-update');

module.exports = class Update {
  static updateOne(db, collection, query, doc, callback) {
    logger.trace('updateOne', { query, doc });
    const coll = db.collection(collection);
    coll.updateOne(query, Helper.removeEmpty(doc), (updateOneError, result) => {
      if (updateOneError) {
        logger.error('updateOne error', { updateOneError });
        return callback(updateOneError);
      }
      return callback(null, result.result);
    });
  }

  static updateMany(db, collection, query, doc, callback) {
    logger.trace('updateMany', { query, doc });
    const coll = db.collection(collection);
    const options = { multi: true };
    coll.update(query, Helper.removeEmpty(doc), options, (updateManyError, result) => {
      if (updateManyError) {
        logger.error('updateMany error', { updateManyError });
        return callback(updateManyError);
      }
      return callback(null, result.result);
    });
  }

  static replaceOne(db, collection, doc, callback) {
    logger.trace('replaceOne', { collection, doc });
    const coll = db.collection(collection);
    coll.replaceOne({ _id: doc._id }, doc, (replaceOneError, result) => {
      if (replaceOneError) {
        logger.error('replaceOne error', { replaceOneError });
        return callback(replaceOneError);
      }
      return callback(null, result.result);
    });
  }
};
