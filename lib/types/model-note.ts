import { NoteImageSize } from '../db/mongo/model-note';

export interface AwsKey {
  Key: string;
}

export interface UploadFileData {
  files: DerivedMulterFile[];
  noteid: string;
  userid: string;
}

export interface UploadedNoteFile {
  id: string;
  ext: string;
  originalname: string;
  size: number;
  sizes?: NoteImageSize[];
}

export interface DerivedMulterFile {
  multerFile: Express.Multer.File;
  noteFile: UploadedNoteFile;
}
