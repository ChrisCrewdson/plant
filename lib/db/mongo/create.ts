import { Db } from 'mongodb';
import { Helper } from './helper';
import { DbCollectionName, UserDetails, DbShape } from './db-types';
import { DbNote } from './model-note';

// See https://stackoverflow.com/a/36794912/1463
// for a description of insertOne/insertMany/bulkWrite

export class Create {
  static async create(db: Db, collection: DbCollectionName, doc: object):
  Promise<any> {
    const coll = db.collection(collection);
    const body = await coll.insertOne(Helper.removeEmpty(doc));
    return body && body.ops;
  }

  // TODO: Fix - remove UserDetails
  static async createOne(db: Db, collection: DbCollectionName, doc: DbShape | UserDetails):
   Promise<any> {
    const body = await Create.create(db, collection, doc);
    return body && body[0];
  }

  static async createLocation(db: Db, doc: DbLocation):
   Promise<DbLocation> {
    return Create.createOne(db, 'location', doc);
  }

  static async createNote(db: Db, doc: DbNote): Promise<DbNote> {
    return Create.createOne(db, 'note', doc);
  }

  static async createPlant(db: Db, doc: DbPlant): Promise<DbPlant> {
    return Create.createOne(db, 'plant', doc);
  }

  static async createUser(db: Db, doc: UserDetails): Promise<DbUser> {
    return Create.createOne(db, 'user', doc);
  }
}
