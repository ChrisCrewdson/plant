const Helper = require('./helper');

// See https://stackoverflow.com/a/36794912/1463
// for a description of insertOne/insertMany/bulkWrite

module.exports = class Create {
  /**
   * Create one or more documents in collection
   * @param {import('mongodb').Db} db
   * @param {string} collection
   * @param {object} doc
   */
  static async create(db, collection, doc) {
    const coll = db.collection(collection);
    const body = await coll.insertOne(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  /**
   * Create single document in collection
   * TODO: Change doc param to a DbShape
   * @param {import('mongodb').Db} db
   * @param {string} collection
   * @param {object} doc
   */
  static async createOne(db, collection, doc) {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }
};
