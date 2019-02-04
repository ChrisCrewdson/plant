const Helper = require('./helper');

// See https://stackoverflow.com/a/36794912/1463
// for a description of insertOne/insertMany/bulkWrite

module.exports = class Create {
  /**
   * Create one or more documents in collection
   * @param {import('mongodb').Db} db
   * @param {DbCollectionName} collection
   * @param {object} doc
   * @returns {Promise}
   */
  static async create(db, collection, doc) {
    const coll = db.collection(collection);
    const body = await coll.insertOne(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  /**
   * Create single document in collection
   * @param {import('mongodb').Db} db
   * @param {DbCollectionName} collection
   * @param {object} doc
   * @returns {Promise}
   */
  static async createOne(db, collection, doc) {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {DbLocation} doc - TODO: Should be a BizLocationNew
   * @returns {Promise<DbLocation>}
   */
  static async createLocation(db, doc) {
    return Create.createOne(db, 'location', doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {BizNoteNew} doc
   * @returns {Promise<DbNote>}
   */
  static async createNote(db, doc) {
    return Create.createOne(db, 'note', doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {DbPlant} doc
   * @returns {Promise<DbPlant>}
   */
  static async createPlant(db, doc) {
    return Create.createOne(db, 'plant', doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {UserDetails} doc
   * @returns {Promise<DbUser>}
   */
  static async createUser(db, doc) {
    return Create.createOne(db, 'user', doc);
  }
};
