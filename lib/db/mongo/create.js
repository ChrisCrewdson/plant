const Helper = require('./helper');

module.exports = class Create {
  /**
   * Create one or more documents in collection
   * @param {import('mongodb').Db} db
   * @param {string} collection
   * @param {object} doc
   */
  static async create(db, collection, doc) {
    const coll = db.collection(collection);
    const body = await coll.insert(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  /**
   * Create single document in collection
   * @param {import('mongodb').Db} db
   * @param {string} collection
   * @param {object} doc
   */
  static async createOne(db, collection, doc) {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }
};
