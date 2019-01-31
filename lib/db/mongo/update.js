const Helper = require('./helper');

/*
MongoDB Driver v3.x changes to:

updateOne & updateMany
The driver now ensures that updated documents contain atomic operators. For instance, if a
user tries to update an existing document but passes in no operations (such as $set, $unset,
or $rename), the driver will now error:

let testCollection = db.collection('test');
testCollection.updateOne({_id: 'test'}, {});
// An error is returned: The update operation document must contain at least one atomic operator.
*/

module.exports = class Update {
  /**
   * Update a single document
   * @param {import('mongodb').Db} db
   * @param {DbCollectionName} collection
   * @param {object} query
   * @param {object} doc
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updateOne(db, collection, query, doc) {
    const coll = db.collection(collection);
    const cleanedDoc = Helper.removeEmpty(doc);
    const set = !cleanedDoc.$set && !cleanedDoc.$unset && !cleanedDoc.$rename
      ? { $set: cleanedDoc }
      : cleanedDoc;

    const result = await coll.updateOne(query, set);
    return result;
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {object} query
   * @param {Partial<DbLocation>} doc
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updateLocation(db, query, doc) {
    return Update.updateOne(db, 'location', query, doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {object} query
   * @param {Partial<DbNote>} doc
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updateNote(db, query, doc) {
    return Update.updateOne(db, 'note', query, doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {object} query
   * @param {Partial<DbPlant>} doc
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updatePlant(db, query, doc) {
    return Update.updateOne(db, 'plant', query, doc);
  }

  /**
   * @param {import('mongodb').Db} db
   * @param {object} query
   * @param {Partial<DbUser>} doc
   * @returns {Promise<import('mongodb').UpdateWriteOpResult>}
   */
  static async updateUser(db, query, doc) {
    return Update.updateOne(db, 'user', query, doc);
  }
};
