const utils = require('../../../../app/libs/utils');
const mongo = require('../../../../lib/db/mongo')();

describe('/lib/db/mongo/update', () => {
  describe('note', () => {
    test('should update the image sizes in a note', async () => {
      const note = {
        userId: utils.makeMongoId(),
        images: [{
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'flower',
          size: 999,
        }, {
          id: utils.makeMongoId(),
          ext: 'jpg',
          originalname: 'leaf',
          size: 666,
        }],
      };
      const sizes = [
        { width: 100, name: 'thumb' },
        { width: 500, name: 'sm' },
        { width: 1000, name: 'md' },
        { width: 1500, name: 'lg' },
        { width: 2000, name: 'xl' },
      ];

      const createdNote = await mongo.upsertNote(note, global.loggerMock);
      expect(createdNote).toBeTruthy();

      const noteUpdate = {
        _id: createdNote._id,
        userId: note.userId,
        imageId: note.images[0].id,
        sizes,
      };

      await mongo.addSizesToNoteImage(noteUpdate);

      const fetchedNote = await mongo.getNoteById(createdNote._id);

      expect(fetchedNote.images[0].sizes).toEqual(sizes);
      expect(fetchedNote.images[1].sizes).toBeFalsy();
    });
  });
});
