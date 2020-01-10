import { getDbInstance } from '../../../../lib/db/mongo';
import utils from '../../../../app/libs/utils';
import { mockLogger } from '../../../mock-logger';
import { BizNote, NoteImageSize } from '../../../../lib/db/mongo/model-note';

const mongo = getDbInstance();

describe('/lib/db/mongo/update', () => {
  describe('note', () => {
    test('should update the image sizes in a note', async () => {
      const note: BizNote = {
        _id: utils.makeMongoIdObject().toString(),
        date: 20180101,
        plantIds: [utils.makeMongoIdObject().toString()],
        userId: utils.makeMongoIdObject().toString(),
        images: [{
          ext: 'jpg',
          id: utils.makeMongoId(),
          originalname: 'flower',
          size: 999,
          sizes: [],
        }, {
          ext: 'jpg',
          id: utils.makeMongoId(),
          originalname: 'leaf',
          size: 666,
          sizes: [],
        }],
      };

      const sizes: NoteImageSize[] = [
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
        imageId: (note.images && note.images[0].id) || '',
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
