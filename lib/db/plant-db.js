// import _ from 'lodash';
import * as BaseDB from './base-db';

// import d from 'debug';
// const debug = d('plant:plant-db');

export class Plant extends BaseDB.BaseDB {

  constructor() {
    super();
  }

  // Need to get the following documents to create the result set:
  // 1. Single Plant document
  // 2. Any scions on the plant (don't know how this will be handled yet)
  // 3. Any notes on the plant or scions (by implication comments on each note)
  getByPlantId(plantId, cb) {
    // TODO: This function should also be doing items listed above.
    super.getById(plantId, (err, plant) => {
      if(err || !plant) {
        return cb(err, plant);
      }

      const params = {
        key: plant._id
      };

      super.getByView('notes', 'notes-by-plant', params, (err2, notes) => {
        if(err2 || !notes || !notes.length) {
          return cb(err2, plant);
        }
        plant.notes = notes;
        return cb(null, plant);
      });
    });
  }

  // Should get an array of plants. Don't need
  // the scions, notes and comments in this call.
  getByUserId(userId, cb) {
    const params = {
      key: userId
    };

    super.getByView('plants', 'plants-by-user', params, cb);
  }

};
