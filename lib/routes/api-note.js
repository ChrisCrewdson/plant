import {requireToken} from '../config/token-check';
import aws from 'aws-sdk';
import mongo from '../db/mongo';
import multer from 'multer';
import multerS3 from 'multer-s3';
import validators from '../../app/models';
import uuid from 'node-uuid';

const logger = require('../logging/logger').create('api-note');

const {
  note: validateNote
} = validators;

export default (app) => {

  // Note CRUD operations
  // Note Create
  app.post('/api/note', requireToken, (req, res) => {

    req.body.userId = req.user._id;
    logger.trace('/api/note req.user._id:', {userId: req.user._id});
    const isNew = true;

    validateNote(req.body, {isNew}, (validateNoteError, transformed) => {
      if(validateNoteError) {
        logger.security('POST /api/note validateNote', {validateNoteError}, {body: req.body}, {isNew});
        return res.status(400).send(validateNoteError);
      }
      logger.trace('/api/note transformed:', transformed);
      mongo.createNote(transformed, (createNoteError, result) => {
        if(createNoteError) {
          logger.error('POST /api/note createNote', {createNoteError}, {transformed}, {result});
          return res.status(500).send('Error creating note. Check Logs');
        }
        return res.status(200).send(result);
      });
    });
  });

  // Note Update
  app.put('/api/note', requireToken, (req, res) => {
    req.body.userId = req.user._id;
    const isNew = false;

    validateNote(req.body, {isNew}, (validateNoteError, transformed) => {
      if(validateNoteError) {
        logger.error('PUT /api/note validateNote', {validateNoteError}, {body: req.body}, {isNew});
        return res.status(400).send(validateNoteError);
      }

      mongo.updateNote(transformed, (updateNoteError, result) => {
        if(updateNoteError) {
          logger.error('PUT /api/note updateNote', {updateNoteError}, {transformed}, {result});
          return res.status(updateNoteError.statusCode || 500).send(updateNoteError);
        }
        return res.status(200).send(result);
      });
    });
  });

  // Note Delete
  app.delete('/api/note/:noteId', requireToken, (req, res) => {

    const {params = {}} = req;
    const {noteId} = params;

    if(!noteId) {
      logger.error('DELETE /api/note/:noteId missing noteId', {params});
      return res.status(403).send({error: 'Missing noteId'});
    }

    const userId = req.user._id;

    mongo.deleteNote(noteId, userId, (deleteNoteError, result) => {
      if(deleteNoteError) {
        logger.error('DELETE /api/note deleteNote', {deleteNoteError}, {params}, {result});
        return res.status(deleteNoteError.statusCode || 500).send('Error deleting note. See Logs');
      } else {
        if(result) {
          return res.status(200).send({success: true});
        }
        logger.warn('Note not found in DELETE /api/note deleteNote', {params});
        return res.status(404).send({message: 'Not Found'});
      }
    });
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
    logger.trace('multer.fileFilter()', {file});
    const acceptFile = (file.mimetype || '').toLowerCase().startsWith('image/');
    if(!acceptFile) {
      logger.info('Rejecting file because not correct mimetype', {file});
    }
    cb(null, acceptFile);
  }

  // #2
  // file: { fieldname: 'file', originalname: '2016-08-27 10.19.41.jpg', encoding: '7bit', mimetype: 'image/jpeg' }
  /**
   * Computes the filename to use in the S3 bucket
   * @param {object} req - the req object
   * @param {object} file - details of file being upload
   * @param {function} cb - function to call with filename
   * @returns {undefined}
   */
  function key(req, file, cb) {
    logger.trace('multer.storage.key()', {file});
    const parts = (file.originalname || '').toLowerCase().split('.');
    const filename = uuid.v4() + (parts.length > 1 ? `.${parts[parts.length - 1]}` : '');
    logger.trace('filename:', {filename});
    cb(null, filename);
  }

  // #3
  function metadata(req, file, cb) {
    logger.trace('multer.storage.metadata()', {file});
    cb(null, {
      fieldName: file.fieldname,
      userId: req.user && req.user._id || ''
    });
  }

  // #4
  // Set the metadata Content-Type used by S3
  function contentType(req, file, cb) {
    logger.trace('multer.storage.contentType()', {file});
    cb(null, file.mimetype);
  }

  const upload = multer({
    fileFilter,
    storage: multerS3({
      acl: 'public-read',
      // export AWS_ACCESS_KEY_ID='AKID'
      // export AWS_SECRET_ACCESS_KEY='SECRET'
      s3: new aws.S3(),
      // Name of bucket on S3
      bucket: 'i.plaaant.com/up/orig',
      metadata,
      key,
      contentType
    })
  });

  function imageNote(req, res, next) {
    logger.trace('imageNote called, req.files', {'req.files': req.files});
    // TODO: Update Note document with image meta data
    return next();
  }

  // TODO: Move magic number 100 to constants file
  app.post('/api/upload', requireToken, imageNote, upload.array('file', 100), (req, res) => {
    logger.trace('Successfully uploaded ' + req.files.length + ' files!', {'req.files': req.files});
    return res.status(200).send({success: true});
  });

};
