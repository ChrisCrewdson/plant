const Helper = require('./helper');
const logger = require('../../logging/logger').create('mongo-update');

module.exports = class Update {
  static async updateOne(db, collection, query, doc) {
    try {
      logger.trace('updateOne', { query, doc });
      const coll = db.collection(collection);
      const result = await coll.updateOne(query, Helper.removeEmpty(doc));
      return result && result.result;
    } catch (updateOneError) {
      logger.error('updateOne', { updateOneError, query, doc });
      throw updateOneError;
    }
  }

  static async updateMany(db, collection, query, doc) {
    try {
      logger.trace('updateMany', { query, doc });
      const coll = db.collection(collection);
      const options = { multi: true };
      const result = coll.update(query, Helper.removeEmpty(doc), options);
      return result && result.result;
    } catch (updateManyError) {
      logger.error('updateMany', { updateManyError, query, doc });
      throw updateManyError;
    }
  }

  static async replaceOne(db, collection, doc) {
    try {
      logger.trace('replaceOne', { collection, doc });
      const coll = db.collection(collection);
      const result = await coll.replaceOne({ _id: doc._id }, doc);
      return result && result.result;
    } catch (replaceOneError) {
      logger.error('replaceOne error', { replaceOneError, collection, doc });
      throw replaceOneError;
    }
  }
};
