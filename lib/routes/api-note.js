const _ = require('lodash');
const aws = require('aws-sdk');
const multer = require('multer');
const { requireToken } = require('../config/token-check');
const constants = require('../../app/libs/constants');
const mongo = require('../db/mongo')();
const validators = require('../../app/models');
const utils = require('../../app/libs/utils');

const moduleName = 'routes/api-note';

const { note: noteValidator } = validators;

module.exports = (app) => {
  // Note CRUD operations
  // Note Upsert
  app.post('/api/note', requireToken, async (req, res) => {
    const { logger } = req;
    logger.trace({
      moduleName,
      method: 'POST /api/note',
      msg: 'upsertNote()',
      req_body: req.body,
    });
    const note = utils.noteFromBody(req.body);

    let transformed;
    try {
      transformed = noteValidator(note);
    } catch (validateNoteError) {
      logger.error({
        moduleName, msg: 'upsertNote /api/note noteValidator', err: validateNoteError, body: req.body,
      });
      return res.status(400).send(validateNoteError);
    }

    try {
      transformed.userId = req.user._id;
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
    logger.trace({ moduleName, msg: 'POST /api/notes', body: req.body });
    const { noteIds, plantIds } = req.body;
    if ((!noteIds || !noteIds.length) && (!plantIds || !plantIds.length)) {
      logger.error({
        moduleName,
        msg: 'No noteIds or plantIds in POST /api/notes',
        noteIds,
        plantIds,
        'req.body': req.body,
      });
      return res.status(404).send('No noteIds/plantIds in body request');
    }

    const okay = (notes) => {
      logger.trace({ moduleName, msg: 'responding with notes:', notes });
      return res.send(notes);
    };

    if (plantIds) {
      try {
        const notes = await mongo.getNotesByPlantIds(plantIds, logger);
        return okay(notes);
      } catch (e) {
        return res.status(500).send('Error getting notes by plantIds');
      }
    }

    try {
      const notes = await mongo.getNotesByIds(noteIds, logger);
      return okay(notes);
    } catch (e) {
      return res.status(500).send('Error getting notes by noteIds');
    }
  });

  const firstDirectory = process.env.NODE_ENV === 'production' ? 'up' : 'test';
  // The image is the object stored in the images array in the note.
  function makeS3KeyFromImage(image, size = 'orig') {
    return `${firstDirectory}/${size}/${image.id}${image.ext && '.'}${image.ext}`;
  }

  function makeS3KeysFromImages(images) {
    return constants.imageSizeNames.reduce(
      (acc, size) => acc.concat(images.map(image => ({ Key: makeS3KeyFromImage(image, size) }))),
      [],
    );
  }

  // Note Delete
  app.delete('/api/note/:noteId', requireToken, async (req, res) => {
    const { params = {}, user = {}, logger } = req;
    const { noteId } = params;
    const { _id: userId } = user;

    if (!noteId) {
      logger.error({ moduleName, msg: 'DELETE /api/note/:noteId missing noteId', params });
      return res.status(403).send({ error: 'Missing noteId' });
    }

    try {
      const note = await mongo.getNoteById(noteId, logger);
      if (note.userId !== userId) {
        throw new Error('Non-owner trying to delete note');
      }

      if (note && note.images && note.images.length) {
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
        logger.trace({ moduleName, msg: 'results from s3 delete', firstDeleted: data.Deleted[0] });
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
  /*
  file param looks like:
  {
    fieldname: 'file',
    originalname: '2016-08-27 10.22.00.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg'
  }
  */
  function fileFilter(req, file, cb) {
    const { logger } = req;
    // logger.trace('moduleName,multer.fileFilter()', {file}, {'req.body': req.body});
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
  function createFileFromMulterObject(file) {
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

  // data:
  // {files, userid}
  async function uploadImages({ data, logger }) {
    // export AWS_ACCESS_KEY_ID='AKID'
    // export AWS_SECRET_ACCESS_KEY='SECRET'
    const s3 = new aws.S3();
    const promises = data.files.map((file) => {
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
    });
    return Promise.all(promises);
  }

  async function imageNote(req, res) {
    const { logger } = req;
    try {
    // req.body: {
    //   note: '{"date":"09/13/2016","note":"ggggg","plantIds":["57cf7efb7157df0000d81f14"],
    //   "userId":"57c74b40a901d8113f7db602","_id":"57d898a2d9ef2e000099f4da"}' }
    // req.files: [
    //   {fieldname: 'file', originalname: '2016-08-28 08.54.26.jpg', encoding: '7bit',
    //     mimetype: 'image/jpeg', buffer: ..., size: 3916869 },
    //   {fieldname: 'file', originalname: '57cf46f4b3deaa59f748927e.jpg', encoding: '7bit',
    //    mimetype: 'image/jpeg', buffer: ..., size: 2718943 }
    //   ]}

      // 1. Upsert note in db
      // 2. Push files to S3
      logger.trace({
        moduleName,
        msg: 'imageNote',
        req_body: req.body,
        req_files: (req.files || []).map(file => _.omit(file, ['buffer'])),
      });
      if (!req.body.note) {
        logger.error({ moduleName, msg: 'Missing note in body on image upload', 'req.body': req.body });
        return res.status(500).send({ success: false, message: 'Failed to find note in body' });
      }
      let note;
      try {
        note = JSON.parse(req.body.note);
      } catch (jsonParseError) {
        logger.error({
          moduleName, msg: 'Error when parsing note from body in image upload', jsonParseError, 'req.body': req.body,
        });
        return res.status(500).send({ success: false, message: 'Failed to parse note from body' });
      }
      note.userId = req.user._id;
      const noteid = note._id.toString();

      const files = (req.files || []).map(file => createFileFromMulterObject(file));
      note.images = (note.images || []).concat(files.map(file => file.noteFile));

      logger.trace({ moduleName, msg: 'note with images', note });

      const updateNote = await mongo.upsertNote(note, logger);
      logger.trace({ moduleName, msg: 'upsertNote result', updateNote });

      req.note = note;
      const data = {
        files,
        userid: req.user._id,
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

  const imageCompleteToken = process.env.PLANT_IMAGE_COMPLETE;
  app.put('/api/image-complete', async (req, res) => {
    const { logger } = req;
    logger.info({ moduleName, msg: 'PUT /api/image-complete', body: req.body });

    if (!imageCompleteToken) {
      const message = 'PLANT_IMAGE_COMPLETE environment variable is not defined';
      logger.error({ moduleName, msg: message });
      return res.send({ success: false, message });
    }

    const { query = {} } = req;
    const { token } = query;
    if (!utils.constantEquals(token, imageCompleteToken)) {
      const message = `Token mismatch: PLANT_IMAGE_COMPLETE=${imageCompleteToken} and token=${token}`;
      logger.error({ moduleName, msg: message });
      return res.send({ success: false });
    }

    const {
      metadata = {},
      sizes = [],
    } = req.body || {};

    if (!sizes.length) {
      const message = `Unexpected length of sizes ${sizes.length}`;
      logger.error({ moduleName, msg: message });
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

    const noteUpdate = {
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
  });
};
