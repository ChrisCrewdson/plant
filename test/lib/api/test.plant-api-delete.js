const helper = require('../../helper');
const assert = require('assert');
const mongo = require('../../../lib/db/mongo');
const utils = require('../../../app/libs/utils');

// const logger = require('../../../lib/logging/logger').create('test.plant-api-delete');

describe('plant-api-delete', () => {
  let userId;
  let locationId;

  beforeAll(
    'it should start the server and setup auth token',
    async () => {
      const data = await helper.startServerAuthenticated();
      assert(data.userId);
      userId = data.user._id;
      locationId = data.user.locationIds[0]._id;
    },
  );

  describe('simple plant deletion', () => {
    test('should delete a plant without notes', async () => {
      const plants = await helper.createPlants(1, userId, locationId);
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/plant/${plants[0]._id}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 200);
      assert.deepStrictEqual(response, { message: 'Deleted' });
    });

    test('should return a 404 if plant id does not exist', async () => {
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/plant/${utils.makeMongoId()}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      assert.equal(httpMsg.statusCode, 404);
      assert.equal(response.message, 'Not Found');
    });
  });

  describe('plant/note deletion', () => {
    test('should delete notes when a plant is deleted', async () => {
      // 1. Create 2 plants
      // 2. Create 3 notes:
      //    Note #1: plantIds reference plant #1
      //    Note #2: plantIds reference plant #1 & #2
      //    Note #3: plantIds reference plant #2
      // 3. Delete plant #1
      // 4. Confirm that Note #1 is no longer in DB
      // 5. Retrieve plant #2 and confirm that both notes are attached.


      // 1. Create 2 plants
      const plants = await helper.createPlants(2, userId, locationId);
      assert.equal(plants.length, 2);

      // 2. Create 3 notes, part 1.1:
      //    Note #1: plantIds reference plant #1

      const response = await helper.createNote([plants[0]._id], { note: 'Note #1' });
      const { note } = response;
      assert.equal(response.success, true);
      assert(note);
      const notes = [note];

      // 2. Create 3 notes, part 1.2:
      //    Update Note #1
      const updatedNote = Object.assign({}, notes[0], { x: 'random' });
      const upsertedNote = await mongo.upsertNote(updatedNote);
      assert(upsertedNote);

      // 2. Create 3 notes, part 2:
      //    Note #2: plantIds reference plant #1 & #2
      const response2 = await helper.createNote([plants[0]._id, plants[1]._id], { note: 'Note #2' });
      assert.equal(response2.success, true);
      const { note: note2 } = response2;
      notes.push(note2);

      // 2. Create 3 notes, part 3:
      //    Note #3: plantIds reference plant #2
      const response3 = await helper.createNote([plants[1]._id], { note: 'Note #3' });
      assert.equal(response3.success, true);
      const { note: note3 } = response3;
      notes.push(note3);

      // 3. Delete plant #1
      const reqOptions = {
        method: 'DELETE',
        authenticate: true,
        json: true,
        url: `/api/plant/${plants[0]._id}`,
      };
      const { response: response4 } = await helper.makeRequest(reqOptions);
      assert.deepStrictEqual(response4, { message: 'Deleted' });

      // 4. Confirm that Note #1 is no longer in DB
      const result2 = await mongo.getNoteById(notes[0]._id);
      assert(!result2);

      // 5. Retrieve plant #2 and confirm that both notes are attached.
      const reqOptions2 = {
        method: 'GET',
        authenticate: true,
        json: true,
        url: `/api/plant/${plants[1]._id}`,
      };

      const { response: plant } = await helper.makeRequest(reqOptions2);
      // assert.equal(httpMsg.statusCode, 200);
      assert(plant);
      assert.equal(plant._id, plants[1]._id);
      assert.equal(plant.notes.length, 2);

      // The notes array should be asc date order.
      const noteIds = [notes[1]._id, notes[2]._id];
      assert(noteIds.indexOf(plant.notes[0]) >= 0);
      assert(noteIds.indexOf(plant.notes[1]) >= 0);

      assert.equal(plants.length, 2);
      assert.equal(notes.length, 3);
    });
  });
});
