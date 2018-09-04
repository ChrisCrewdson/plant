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
   * @param {string} collection
   * @param {object} query
   * @param {object} doc
   * @returns {Promise}
   */
  static async updateOne(db, collection, query, doc) {
    const coll = db.collection(collection);
    const cleanedDoc = Helper.removeEmpty(doc);
    const set = !cleanedDoc.$set && !cleanedDoc.$unset && !cleanedDoc.$rename
      ? { $set: cleanedDoc }
      : cleanedDoc;

    const result = await coll.updateOne(query, set);
    return result && result.result;
  }

  /*
  These methods commented because not currently being used.
  Before uncommenting make sure that they are working correctly with code coverage.
  The MongoDB driver requires an atomic operation on update.

  static async updateMany(db, collection, query, doc) {
    try {
      const coll = db.collection(collection);
      const options = { multi: true };
      const result = await coll.update(query, Helper.removeEmpty(doc), options);
      return result && result.result;
    } catch (updateManyError) {
      throw updateManyError;
    }
  }

  static async replaceOne(db, collection, doc) {
    try {
      const coll = db.collection(collection);
      const result = await coll.replaceOne({ _id: doc._id }, doc);
      return result && result.result;
    } catch (replaceOneError) {
      throw replaceOneError;
    }
  }
  */
};
