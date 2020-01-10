import {
  Db, UpdateWriteOpResult, UpdateQuery, FilterQuery, ObjectID,
} from 'mongodb';
import { Helper } from './helper';
import { DbCollectionName, DbShape } from './db-types';
import { NoteImageSize, DbNote } from './model-note';

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

// interface GenericUpdateQuery {
//   [key: string]: any;
// }

interface AddImageSizesQuery {
  _id: ObjectID;
  images: {
    $elemMatch: {
      id: string;
    };
  };
  userId: ObjectID;
}

interface AddImageSizesSet {
  $set: {
    'images.$.sizes': NoteImageSize[];
  };
}

export class Update {
  static async updateOne(db: Db, collection: DbCollectionName, filter: FilterQuery<any>,
    doc: Partial<DbShape> | AddImageSizesSet): Promise<UpdateWriteOpResult> {
    const coll = db.collection(collection);
    const cleanedDoc = Helper.removeEmpty(doc) as UpdateQuery<any> | Partial<any>;
    const set = !cleanedDoc.$set && !cleanedDoc.$unset && !cleanedDoc.$rename
      ? { $set: cleanedDoc }
      : cleanedDoc;

    const result = await coll.updateOne(filter, set);
    return result;
  }

  static async updateLocation(db: Db, filter: FilterQuery<any>,
    updateDoc: DbLocation): Promise<UpdateWriteOpResult> {
    return Update.updateOne(db, 'location', filter, updateDoc);
  }

  static async updateNote(db: Db, filter: FilterQuery<any>, updateDoc: Partial<Readonly<DbNote>>):
    Promise<UpdateWriteOpResult> {
    return Update.updateOne(db, 'note', filter, updateDoc);
  }

  static async updatePlant(db: Db, filter: FilterQuery<any>, updateDoc: DbPlant):
   Promise<UpdateWriteOpResult> {
    return Update.updateOne(db, 'plant', filter, updateDoc);
  }

  static async updateUser(db: Db, filter: FilterQuery<any>, updateDoc: DbUser):
   Promise<UpdateWriteOpResult> {
    return Update.updateOne(db, 'user', filter, updateDoc);
  }

  static async addSizesToNoteImage(db: Db, filter: AddImageSizesQuery,
    updateDoc: AddImageSizesSet):
  Promise<UpdateWriteOpResult> {
    return Update.updateOne(db, 'note', filter, updateDoc);
  }
}
