const Helper = require('./helper');

module.exports = class Create {
  static async create(db, collection, doc) {
    const coll = db.collection(collection);
    const body = await coll.insert(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  static async createOne(db, collection, doc) {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }
};
