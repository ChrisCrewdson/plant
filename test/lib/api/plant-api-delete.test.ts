import { getDbInstance } from '../../../lib/db/mongo';
import * as helper from '../../helper';

const mongo = getDbInstance();
const utils = require('../../../app/libs/utils');
const { mockLogger } = require('../../mock-logger');

describe('plant-api-delete', () => {
  let userId: string;
  let locationId: string;

  beforeAll(async () => {
    const data = await helper.startServerAuthenticated();
    expect(data.userId).toBeTruthy();
    userId = data.user._id;
    [locationId] = data.user.locationIds;
  });
  afterAll(() => helper.stopServer());

  describe('simple plant deletion', () => {
    test('should delete a plant without notes', async () => {
      const plants = await helper.createPlants(1, userId, locationId);
      const reqOptions: HelperMakeRequestOptions = {
        method: 'DELETE',
        authenticate: true,
        url: `/api/plant/${plants[0]._id}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(200);
      expect(httpMsg).toEqual({ message: 'Deleted' });
    });

    test('should return a 404 if plant id does not exist', async () => {
      const reqOptions: HelperMakeRequestOptions = {
        method: 'DELETE',
        authenticate: true,
        url: `/api/plant/${utils.makeMongoId()}`,
      };

      const { httpMsg, response } = await helper.makeRequest(reqOptions);
      expect(response.status).toBe(404);
      expect(httpMsg.message).toBe('Not Found');
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
      expect(plants).toHaveLength(2);

      // 2. Create 3 notes, part 1.1:
      //    Note #1: plantIds reference plant #1

      const response = await helper.createNote([plants[0]._id], { note: 'Note #1' });
      const { note } = response;
      expect(response.success).toBe(true);
      expect(note).toBeTruthy();
      const notes = [note];

      // 2. Create 3 notes, part 1.2:
      //    Update Note #1
      const updatedNote = { ...notes[0], x: 'random' };
      const upsertedNote = await mongo.upsertNote(updatedNote, mockLogger);
      expect(upsertedNote).toBeTruthy();

      // 2. Create 3 notes, part 2:
      //    Note #2: plantIds reference plant #1 & #2
      const response2 = await helper.createNote([plants[0]._id, plants[1]._id], { note: 'Note #2' });
      expect(response2.success).toBe(true);
      const { note: note2 } = response2;
      notes.push(note2);

      // 2. Create 3 notes, part 3:
      //    Note #3: plantIds reference plant #2
      const response3 = await helper.createNote([plants[1]._id], { note: 'Note #3' });
      expect(response3.success).toBe(true);
      const { note: note3 } = response3;
      notes.push(note3);

      // 3. Delete plant #1
      const reqOptions: HelperMakeRequestOptions = {
        method: 'DELETE',
        authenticate: true,
        url: `/api/plant/${plants[0]._id}`,
      };
      const { httpMsg: response4 } = await helper.makeRequest(reqOptions);
      expect(response4).toEqual({ message: 'Deleted' });

      // 4. Confirm that Note #1 is no longer in DB
      const result2 = await mongo.getNoteById(notes[0]._id, mockLogger);
      expect(result2).toBeUndefined();

      // 5. Retrieve plant #2 and confirm that both notes are attached.
      const reqOptions2: HelperMakeRequestOptions = {
        method: 'GET',
        authenticate: true,
        url: `/api/plant/${plants[1]._id}`,
      };

      const { httpMsg: plant } = await helper.makeRequest(reqOptions2);
      // expect(httpMsg.statusCode).toBe(200);
      expect(plant).toBeInstanceOf(Object);
      expect(plant._id).toBe(plants[1]._id);
      expect(plant.notes).toHaveLength(2);

      // The notes array should be asc date order.
      const noteIds = [notes[1]._id, notes[2]._id];
      expect(noteIds.indexOf(plant.notes[0]) >= 0).toBeTruthy();
      expect(noteIds.indexOf(plant.notes[1]) >= 0).toBeTruthy();

      expect(plants).toHaveLength(2);
      expect(notes).toHaveLength(3);
    });
  });
});
