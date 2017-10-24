// Script to delete all plant-test-* databases from a mongo server.

// eslint-disable-next-line no-undef
const databases = db.getMongo().getDBNames();
databases.forEach((database) => {
// eslint-disable-next-line no-undef
  const d = db.getMongo().getDB(database);
  const name = d.getName();
  if (name.includes('plant-test-')) {
    // eslint-disable-next-line no-restricted-globals
    print(`dropping db ${name}`);
    d.dropDatabase();
  }
});
