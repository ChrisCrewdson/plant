const utils = require('../../../../app/libs/utils');
const mongo = require('../../../../lib/db/mongo')();
const { mockLogger } = require('../../../mock-logger');

describe('/lib/db/mongo/update', () => {
  describe('note', () => {
    test('should update the image sizes in a note', async () => {
      /** @type {DbNote} */
      const note = {
        date: 20180101,
        plantIds: [],
        _id: utils.makeMongoIdObject(),
        userId: utils.makeMongoIdObject(),
        images: [{
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'flower',
          size: 999,
          sizes: [],
        }, {
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'leaf',
          size: 666,
          sizes: [],
        }],
      };
      const sizes = [
        { width: 100, name: 'thumb' },
        { width: 500, name: 'sm' },
        { width: 1000, name: 'md' },
        { width: 1500, name: 'lg' },
        { width: 2000, name: 'xl' },
      ];

      const createdNote = await mongo.upsertNote(note, mockLogger);
      expect(createdNote).toBeTruthy();

      const noteUpdate = {
        _id: createdNote._id,
        userId: note.userId,
        imageId: note.images && note.images[0].id,
        sizes,
      };

      await mongo.addSizesToNoteImage(noteUpdate, mockLogger);

      const fetchedNote = await mongo.getNoteById(createdNote._id, mockLogger);

      // This makes tsc happy.
      if (!fetchedNote || !fetchedNote.images) {
        throw new Error(`fetchedNote or fetchedNote.images is falsy ${fetchedNote}`);
      }

      expect(fetchedNote.images[0].sizes).toEqual(sizes);
      expect(fetchedNote.images[1].sizes).toHaveLength(0);
    });
  });
});
