import { UploadedNoteFile } from './routes/api-note';

const firstDirectory = process.env.NODE_ENV === 'production' ? 'up' : 'test';

/**
 * The image is the object stored in the images array in the note.
 */
export const makeS3KeyFromImage = (image: UploadedNoteFile, size: ImageSizeName = 'orig',
) => `${firstDirectory}/${size}/${image.id}${image.ext && '.'}${image.ext}`;
