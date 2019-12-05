import { Application, Request, Response } from 'express';
import _ from 'lodash';
import aws from 'aws-sdk';
import multer from 'multer';

import Logger from 'lalog';
import { getDbInstance } from '../db/mongo';
import { requireToken } from '../auth/token-check';
import * as constants from '../../app/libs/constants';
import { serverValidateNote } from '../validation/ssv-note';
import utils from '../../app/libs/utils';
import { makeS3KeyFromImage } from '../utils';

interface ImageCompleteRequest {
  logger: Logger;
  body?: ImageCompleteBody;
  query?: ImageCompleteQuery;
}

const mongo = getDbInstance();

const moduleName = 'routes/api-note';

/**
 * api note routes
 */
export const noteApi = (app: Application): void => {
  // Note CRUD operations
  // Note Upsert
  app.post('/api/note', requireToken, async (req, res) => {
    const { logger, body } = req;
    logger.trace({
      moduleName,
      method: 'POST /api/note',
      msg: 'upsertNote()',
      body,
    });

    let transformed: BizNoteNew;
    try {
      transformed = serverValidateNote(req);
    } catch (validateNoteError) {
      logger.error({
        moduleName, msg: 'upsertNote /api/note noteValidator', err: validateNoteError, body,
      });
      return res.status(400).send('Error validating note during upsert. Check logs.');
    }

    try {
      logger.trace({ moduleName, msg: '/api/note transformed:', transformed });
      await mongo.upsertNote(transformed, logger);
      return res.status(200).send({ success: true, note: transformed });
    } catch (upsertNoteError) {
      logger.error({
        moduleName, msg: '/api/note upsertNote', err: upsertNoteError, transformed,
      });
      return res.status(500).send('Error upserting note. Check Logs');
    }
  });

  // Note Read Multiple
  app.post('/api/notes', async (req, res) => {
    const { logger } = req;
    const { body }: { body: LoadNotesRequestPayload } = req;
    const { noteIds, plantIds } = body;
    logger.trace({ moduleName, msg: 'POST /api/notes', body });

    /**
     * Send the notes to the client
     */
    const okay = (notes?: ReadonlyArray<BizNote>): void => {
      logger.trace({ moduleName, msg: 'responding with notes:', notes });
      res.send(notes || []);
    };

    if (plantIds?.length) {
      try {
        const notes = await mongo.getNotesByPlantIds(plantIds, logger);
        return okay(notes);
      } catch (e) {
        return res.status(500).send('Error getting notes by plantIds');
      }
    }

    if (noteIds?.length) {
      try {
        const notes = await mongo.getNotesByIds(noteIds, logger);
        return okay(notes);
      } catch (e) {
        return res.status(500).send('Error getting notes by noteIds');
      }
    }

    logger.error({
      moduleName,
      msg: 'No noteIds or plantIds in POST /api/notes',
      noteIds,
      plantIds,
      body,
    });
    return res.status(404).send('No noteIds/plantIds in body request');
  });

  /**
   * Make S3 Keys from Image objects
   */
  function makeS3KeysFromImages(images: NoteImage[]): AwsKey[] {
    return constants.imageSizeNames.reduce(
      (acc: AwsKey[], size: ImageSizeName) => acc.concat(images.map((image) => {
        const key: AwsKey = {
          Key: makeS3KeyFromImage(image, size),
        };
        return key;
      })),
      [],
    );
  }

  // Note Delete
  app.delete('/api/note/:noteId', requireToken, async (req, res) => {
    const { params = {}, user, logger } = req;
    const { noteId } = params;
    const userId = user?._id;

    if (!noteId) {
      logger.error({ moduleName, msg: 'DELETE /api/note/:noteId missing noteId', params });
      return res.status(403).send({ error: 'Missing noteId' });
    }

    try {
      const note = await mongo.getNoteById(noteId, logger);
      if (!note) {
        throw new Error(`No note found for noteId ${noteId}`);
      }
      if (note.userId !== userId) {
        throw new Error('Non-owner trying to delete note');
      }

      if (note?.images?.length) {
        const s3 = new aws.S3();

        const options = {
          Bucket: constants.awsBucketName,
          Delete: {
            Objects: makeS3KeysFromImages(note.images),
          },
        };

        logger.trace({
          moduleName, msg: 'About to delete S3 images', images: note.images, Delete: options.Delete.Objects,
        });

        const data = await s3.deleteObjects(options).promise();
        logger.trace({
          moduleName,
          msg: 'results from s3 delete',
          firstDeleted: data && data.Deleted && data.Deleted.length && data.Deleted[0],
        });
      }

      const result = await mongo.deleteNote(noteId, userId, logger);
      if (result) {
        return res.status(200).send({ success: true });
      }
      logger.warn({ moduleName, msg: 'Note not found in DELETE /api/note deleteNote', params });
      return res.status(404).send({ message: 'Not Found' });
    } catch (deleteNoteError) {
      logger.error({
        moduleName,
        msg: 'DELETE /api/note deleteNote',
        err: deleteNoteError,
        params,
        user,
      });
      return res.status(500).send('Error deleting note. See Logs');
    }
  });


  // #1
  /**
   * Not sure what this does...
   */
  function fileFilter(req: Express.Request, file: Express.Multer.File, cb: Function): void {
    const { logger } = req;
    const acceptFile = (file.mimetype || '').toLowerCase().startsWith('image/');
    if (!acceptFile) {
      logger.info({ moduleName, msg: 'Rejecting file because not correct mimetype', file });
    }
    cb(null, acceptFile);
  }

  const storage = multer.memoryStorage();
  const upload = multer({ fileFilter, storage });

  // file:
  // {fieldname: 'file', originalname: '2016-08-28 08.54.26.jpg',
  // encoding: '7bit', mimetype: 'image/jpeg', buffer: ..., size: 3916869 }
  function createFileFromMulterObject(file: Express.Multer.File): DerivedMulterFile {
    const { originalname: original = '', size } = file;
    const parts = original.toLowerCase().split('.');
    const ext = parts.length > 1 ? parts[parts.length - 1] : '';
    const id = utils.makeMongoId();
    const snip = ext && ext.length > 0 ? ext.length + 1 : 0;
    const originalname = original.slice(0, -snip);
    return {
      noteFile: {
        id, ext, originalname, size,
      },
      multerFile: file,
    };
  }

  /**
   * Upload images
   */
  async function uploadImages({ data, logger }:
    {data: UploadFileData; logger: Logger}): Promise<any> {
    // export AWS_ACCESS_KEY_ID='AKID'
    // export AWS_SECRET_ACCESS_KEY='SECRET'
    // Request<S3.Types.PutObjectOutput, AWSError>
    const s3 = new aws.S3();

    const fileMapper = async (file: DerivedMulterFile): Promise<any> => {
      const Metadata = {
        userid: data.userid,
        noteid: data.noteid,
        originalname: file.noteFile.originalname,
        id: file.noteFile.id,
      };
      const params = {
        Bucket: constants.awsBucketName,
        ContentType: file.multerFile.mimetype,
        Key: makeS3KeyFromImage(file.noteFile),
        Metadata,
        Body: file.multerFile.buffer,
      };
      logger.trace({
        moduleName,
        msg: 'About to upload to s3',
        params: _.omit(params, ['Body']),
        Metadata,
      });
      return s3.putObject(params).promise();
    };

    const promises = data.files.map(fileMapper);
    return Promise.all(promises);
  }

  /**
   * Image Note
   */
  async function imageNote(req: Request, res: Response): Promise<Response> {
    const {
      logger, user, body, files: requestFiles,
    } = req;
    try {
    // req.body: {
    //   note: '{"date":"09/13/2016","note":"ggggg","plantIds":["57cf7efb7157df0000d81f14"],
    //   "userId":"57c74b40a901d8113f7db602","_id":"57d898a2d9ef2e000099f4da"}' }
    // requestFiles: [
    //   {fieldname: 'file', originalname: '2016-08-28 08.54.26.jpg', encoding: '7bit',
    //     mimetype: 'image/jpeg', buffer: ..., size: 3916869 },
    //   {fieldname: 'file', originalname: '57cf46f4b3deaa59f748927e.jpg', encoding: '7bit',
    //    mimetype: 'image/jpeg', buffer: ..., size: 2718943 }
    //   ]}

      const multerFiles = _.isArray(requestFiles) ? requestFiles : [];

      // 1. Upsert note in db
      // 2. Push files to S3
      logger.trace({
        moduleName,
        msg: 'imageNote',
        user,
        body,
        requestFiles: multerFiles.map((file: any) => _.omit(file, ['buffer'])),
      });
      const userId = user?._id;
      if (!userId) {
        logger.error({ moduleName, msg: 'Missing user id in request in imageNote', body });
        return res.status(401).send({ success: false, message: 'No user logged in' });
      }
      if (!req.body.note) {
        logger.error({ moduleName, msg: 'Missing note in body on image upload', body });
        return res.status(500).send({ success: false, message: 'Failed to find note in body' });
      }
      let note;
      try {
        note = JSON.parse(req.body.note);
      } catch (jsonParseError) {
        logger.error({
          moduleName, msg: 'Error when parsing note from body in image upload', jsonParseError, body,
        });
        return res.status(500).send({ success: false, message: 'Failed to parse note from body' });
      }
      note.userId = userId;
      const noteid = note._id.toString();

      const files = multerFiles.map(createFileFromMulterObject);
      note.images = (note.images || []).concat(files.map((file: any) => file.noteFile));

      logger.trace({ moduleName, msg: 'note with images', note });

      const updateNote = await mongo.upsertNote(note, logger);
      logger.trace({ moduleName, msg: 'upsertNote result', updateNote });

      const data: UploadFileData = {
        files,
        userid: userId,
        noteid,
      };

      await uploadImages({ data, logger });

      return res.status(200).send({ success: true, note });
    } catch (upsertNoteError) {
      logger.error({ moduleName, msg: 'mongo.upsertNote in imageNote', err: upsertNoteError });
      return res.status(500).send({ success: false, message: 'Upload failed' });
    }
  }

  app.post('/api/upload', requireToken, upload.array('file', constants.maxImageFilesPerUpload), imageNote);

  /**
   * This is a shared secret between this web server and the plant-image-lambda function
   * to allow the lambda function to PUT against the server.
   */
  const imageCompleteToken = process.env.PLANT_IMAGE_COMPLETE;

  /**
   * This is the route/endpoint called by the plant-image-lambda function once
   * it has completed processing an image. It shares a secret with the web
   * server to prevent malicious PUTs against this endpoint.
   */
  const imageCompleteRoute = async (req: Request, res: Response): Promise<Response> => {
    const { logger, body, query } = req as ImageCompleteRequest;
    logger.info({ moduleName, msg: 'PUT /api/image-complete', body });

    if (!imageCompleteToken) {
      const message = 'PLANT_IMAGE_COMPLETE environment variable is not defined';
      logger.error({ moduleName, msg: message });
      return res.send({ success: false, message });
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const token = query?.token;
    if (!utils.constantEquals(token, imageCompleteToken)) {
      const message = `Token mismatch: PLANT_IMAGE_COMPLETE=${imageCompleteToken} and token=${token}`;
      logger.error({ moduleName, msg: message });
      return res.send({ success: false });
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const sizes = body?.sizes;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const metadata = body?.metadata;

    if (!metadata || !sizes || !sizes.length) {
      const message = `Unexpected metadata ${metadata} and/or length of sizes ${sizes?.length}`;
      logger.error({
        moduleName, msg: message, metadata, sizes,
      });
      return res.send({ success: false, message });
    }

    const {
      noteid: _id,
      id: imageId,
      userid: userId,
    } = metadata;

    // req.body:
    // {"metadata":{
    //   "userid":"57c74b40a901d8113f7db602",
    //   "id":"57d9f5536420d13e0e1e6a30",
    //   "noteid":"57d9f5536e7b1200005a99e7",
    //   "originalname":"princess grape..."
    // },"sizes":[
    //   {"width":100,"name":"thumb"},
    //   {"width":500,"name":"sm"},
    //   {"width":1000,"name":"md"},
    //   {"width":1500,"name":"lg"},
    //   {"width":2000,"name":"xl"}
    // ]}

    const noteUpdate: NoteImageUpdateData = {
      _id,
      userId,
      imageId,
      sizes,
    };

    try {
      await mongo.addSizesToNoteImage(noteUpdate, logger);
      return res.send({ success: true });
    } catch (e) {
      // Error has already been logged in data layer
      return res.status(500).send({ success: false, message: 'Error updating note' });
    }
  };

  app.put('/api/image-complete', imageCompleteRoute);
};
