// index-db.js is used for managing the indexes in cloudant.
import async from 'async';
import * as BaseDB from './base-db';
import d from 'debug';

const debug = d('plant:index-db');

export class Index extends BaseDB.BaseDB {

  constructor() {
    super();
  }

  listIndexes(cb) {

    super.getDb((err, db) => {
      // TODO: Handle error
      db.index(function(error, result) {
        if (error) {
          // TODO: Log error
          debug('Index.listIndexes error:', error);
          return cb(error);
        }

        debug('The database has %d indexes', result.indexes.length);
        result.indexes.forEach((index) => {
          debug('  %s (%s): %j', index.name, index.type, index.def);
        });
        return cb(null, result.indexes);
      });
    });

  }

  createIndex(index, cb) {

    super.getDb((err, db) => {
      db.index(index, function(error, response) {
        if (error) {
          // TODO: Log error
          debug('Index.createIndex error:', error);
          return cb(error);
        }

        debug('Index creation result: %s', response.result);
        return cb(error, response.result);
      });
    });

  }

  // Return the list of indexes that should be set on the DB.
  getIndexes() {
    const userByEmail = {
      // TODO: How do I name the query? e.g.:
      // _id: '_design/user-by-email',
      name: 'user-by-email',
      type: 'json',
      index: {
        fields: ['type', 'email']
      }
    };

    const typeByUser = {
      name: 'type-by-user',
      type: 'json',
      index: {
        fields: ['type', 'user']
      }
    };

    return [userByEmail, typeByUser];
  }

  // Intention that this is to be used against a fresh DB that is being
  // setup for the first time. e.g. if an integration test is being run
  // then a temporary DB might be setup.
  // There should probably be an updateAllIndexes() function that runs
  // when the app spins up to ensure that all indexes are up-to-date.
  createAllIndexes(cb) {

    const indexes = this.getIndexes();

    super.getDb((err, db) => {
      async.each(indexes,
        function(index, done) {
          db.index(index, done);
        }, cb);
    });

  }

};
