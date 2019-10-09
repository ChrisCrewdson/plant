import { Helper } from './helper';

// See https://stackoverflow.com/a/36794912/1463
// for a description of insertOne/insertMany/bulkWrite

module.exports = class Create {
  static async create(db: import('mongodb').Db, collection: DbCollectionName, doc: object):
  Promise<any> {
    const coll = db.collection(collection);
    const body = await coll.insertOne(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  static async createOne(db: import('mongodb').Db, collection: DbCollectionName, doc: object):
   Promise<any> {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }

  static async createLocation(db: import('mongodb').Db, doc: DbLocation):
   Promise<DbLocation> {
    return Create.createOne(db, 'location', doc);
  }

  static async createNote(db: import('mongodb').Db, doc: BizNoteNew): Promise<DbNote> {
    return Create.createOne(db, 'note', doc);
  }

  static async createPlant(db: import('mongodb').Db, doc: DbPlant): Promise<DbPlant> {
    return Create.createOne(db, 'plant', doc);
  }

  static async createUser(db: import('mongodb').Db, doc: UserDetails): Promise<DbUser> {
    return Create.createOne(db, 'user', doc);
  }
};
