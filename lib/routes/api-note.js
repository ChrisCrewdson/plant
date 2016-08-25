import mongo from '../db/mongo';
import {requireToken} from '../config/token-check';
import validators from '../../app/models';

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

};
