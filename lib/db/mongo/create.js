const Helper = require('./helper');

const logger = require('../../logging/logger').create('mongo-create');

module.exports = class Create {
  static async create(db, collection, doc) {
    const coll = db.collection(collection);
    const body = await coll.insert(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  static async createOne(db, collection, doc) {
    logger.trace('createOne before:', { doc });
    const body = await Create.create(db, collection, doc);
    logger.trace('createOne after:', { body });
    return body && body[0];
  }
};
