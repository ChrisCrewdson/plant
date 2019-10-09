import { Db, UpdateWriteOpResult, UpdateQuery } from 'mongodb';
import { Helper } from './helper';

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

interface GenericUpdateQuery {
  [key: string]: any;
}

module.exports = class Update {
  static async updateOne(db: Db, collection: DbCollectionName,
    query: UpdateQuery<GenericUpdateQuery>, doc: object): Promise<UpdateWriteOpResult> {
    const coll = db.collection(collection);
    const cleanedDoc = Helper.removeEmpty(doc) as UpdateQuery<GenericUpdateQuery>;
    const set = !cleanedDoc.$set && !cleanedDoc.$unset && !cleanedDoc.$rename
      ? { $set: cleanedDoc }
      : cleanedDoc;

    const result = await coll.updateOne(query, set);
    return result;
  }

  static async updateLocation(db: import('mongodb').Db, query: object,
    doc: Partial<DbLocation>): Promise<import('mongodb').UpdateWriteOpResult> {
    return Update.updateOne(db, 'location', query, doc);
  }

  static async updateNote(db: import('mongodb').Db, query: object, doc: Partial<DbNote>):
   Promise<import('mongodb').UpdateWriteOpResult> {
    return Update.updateOne(db, 'note', query, doc);
  }

  static async updatePlant(db: import('mongodb').Db, query: object, doc: Partial<DbPlant>):
   Promise<import('mongodb').UpdateWriteOpResult> {
    return Update.updateOne(db, 'plant', query, doc);
  }

  static async updateUser(db: import('mongodb').Db, query: object, doc: Partial<DbUser>):
   Promise<import('mongodb').UpdateWriteOpResult> {
    return Update.updateOne(db, 'user', query, doc);
  }
};
