import * as helper from '../../helper';
import assert from 'assert';
import async from 'async';
import * as BaseDB from '../../../lib/db/base-db';

// import d from 'debug';
// const debug = d('plant:test.note-api');

describe('plant-api-delete', function() {
  this.timeout(10000);
  let userId;
  const baseDB = new BaseDB.BaseDB();

  before('it should start the server and setup auth token', done => {
    helper.startServerAuthenticated((err, data) => {
      assert(data.userId);
      userId = data.userId;
      done();
    });
  });

  describe('plant/note deletion', () => {
    it('should delete notes when a plant is deleted', (done) => {
      // 1. Create 2 plants
      // 2. Create 3 notes:
      //    Note #1: plantIds reference plant #1
      //    Note #2: plantIds reference plant #1 & #2
      //    Note #3: plantIds reference plant #2
      // 3. Delete plant #1
      // 4. Confirm that Note #1 is no longer in DB
      // 5. Retrieve plant #2 and confirm that both notes are attached.

      async.waterfall([

        // 1. Create 2 plants
        async.apply(helper.createPlants, 2, userId),

        // 2. Create 3 notes, part 1.1:
        //    Note #1: plantIds reference plant #1
        (plants, cb) => {
          assert(plants.length, 2);
          helper.createNote([plants[0]._id], {note: 'Note #1'}, (err, note) => {
            assert(note);
            cb(err, plants, [note]);
          });
        },

        // 2. Create 3 notes, part 1.2:
        //    Update Note #1 so that it's on revision 2-...
        (plants, notes, cb) => {
          const updatedNote = {...notes[0], x: 'random'};
          baseDB.updateSet(updatedNote, (err, note) => {
            assert(!err);
            assert(note);
            assert.equal(note.rev.slice(0, 2), '2-');
            cb(err, plants, notes);
          });
        },

        // 2. Create 3 notes, part 2:
        //    Note #2: plantIds reference plant #1 & #2
        (plants, notes, cb) => {
          helper.createNote([plants[0]._id, plants[1]._id], {note: 'Note #2'}, (err, note) => {
            assert(note);
            notes.push(note);
            cb(err, plants, notes);
          });
        },

        // 2. Create 3 notes, part 3:
        //    Note #3: plantIds reference plant #2
        (plants, notes, cb) => {
          helper.createNote([plants[1]._id], {note: 'Note #3'}, (err, note) => {
            assert(note);
            notes.push(note);
            cb(err, plants, notes);
          });
        },

        // 3. Delete plant #1
        (plants, notes, cb) => {

          const reqOptions = {
            method: 'DELETE',
            authenticate: true,
            json: true,
            url: `/api/plant/${plants[0]._id}`
          };

          helper.makeRequest(reqOptions, (error, httpMsg, response) => {
            assert(!error);
            assert.equal(httpMsg.statusCode, 200);
            assert(response.ok);
            cb(error, plants, notes);
          });

        },

        // 4. Confirm that Note #1 is no longer in DB
        (plants, notes, cb) => {
          baseDB.getById(notes[0]._id, (err, result) => {
            assert.equal(err.statusCode, 404);
            assert.equal(err.reason, 'deleted');
            assert(!result);
            cb(null, plants, notes);
          });
        },

        // 5. Retrieve plant #2 and confirm that both notes are attached.
        (plants, notes, cb) => {
          const reqOptions = {
            method: 'GET',
            authenticate: true,
            json: true,
            url: `/api/plant/${plants[1]._id}`
          };

          helper.makeRequest(reqOptions, (error, httpMsg, plant) => {
            assert(!error);
            assert.equal(httpMsg.statusCode, 200);
            assert(plant);
            assert.equal(plant._id, plants[1]._id);
            assert.equal(plant.notes.length, 2);

            // The notes array could be in any order.
            // TODO: Should sort in date order in DB
            const noteIds = [notes[1]._id, notes[2]._id];
            assert(noteIds.indexOf(plant.notes[0]._id) >= 0);
            assert(noteIds.indexOf(plant.notes[1]._id) >= 0);

            cb(error, plants, notes);
          });
        },
      ],

      // Final callback
      (err, plants, notes) => {
        assert(!err);
        assert.equal(plants.length, 2);
        assert.equal(notes.length, 3);
        done();
      });

    });

  });

});
