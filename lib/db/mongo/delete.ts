export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

module.exports = async (db: import('mongodb').Db, collection: DbCollectionName, query: object):
 Promise<number | undefined> => {
  const coll = db.collection(collection);
  const results = await coll.deleteMany(query);
  // results if query item was found:
  //
  // { result: { ok: 1, n: 3 }, deletedCount: 3
  //
  // result if query item was not found:
  //
  // { result: { ok: 1, n: 0 }, deletedCount: 0
  return results && results.deletedCount;
};
