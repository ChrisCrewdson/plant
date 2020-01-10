import { ImageSizeName } from './db/mongo/model-note';
import { UploadedNoteFile } from './types/model-note';

const firstDirectory = process.env.NODE_ENV === 'production' ? 'up' : 'test';

/**
 * The image is the object stored in the images array in the note.
 */
export const makeS3KeyFromImage = (image: UploadedNoteFile, size: ImageSizeName = 'orig',
): string => `${firstDirectory}/${size}/${image.id}${image.ext && '.'}${image.ext}`;
