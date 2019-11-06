import { produce } from 'immer';

import { makeS3KeyFromImage } from '../../lib/utils';
import { UploadedNoteFile } from '../../lib/routes/api-note';

describe('utils', () => {
  describe('makeS3KeyFromImage', () => {
    const image = produce({}, () => ({
      id: 'id',
      ext: 'ext',
      originalname: 'original-name',
      size: 2222,
      sizes: [
        {
          name: 'lg',
          width: 2000,
        },
        {
          name: 'sm',
          width: 500,
        },
      ],
    })) as UploadedNoteFile;

    test('produces expected key', () => {
      const key = makeS3KeyFromImage(image);
      expect(key).toMatchInlineSnapshot('"test/orig/id.ext"');
    });

    test('uses imageSizeName', () => {
      const key = makeS3KeyFromImage(image, 'sm');
      expect(key).toMatchInlineSnapshot('"test/sm/id.ext"');
    });

    test('works without size', () => {
      const altImage = produce(image, (draft) => {
        delete draft.sizes;
      });
      const key = makeS3KeyFromImage(altImage, 'sm');
      expect(key).toMatchInlineSnapshot('"test/sm/id.ext"');
    });

    test('works with empty ext', () => {
      const altImage = produce(image, (draft) => {
        draft.ext = '';
      });
      const key = makeS3KeyFromImage(altImage, 'sm');
      expect(key).toMatchInlineSnapshot('"test/sm/id"');
    });
  });
});
