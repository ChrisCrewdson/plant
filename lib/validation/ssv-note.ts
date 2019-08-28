import { Request } from 'express';
// SSV = Server Side Validation
const validators = require('../../app/models');
const utils = require('../../app/libs/utils');

const { note: noteValidator } = validators;

interface NoteUpsertRequest extends Request {
  body: UiInterimNote;
  user?: BizUser;
}

/**
 * When receiving an upsert request from a client for a Note we
 * need to validate the note properties and convert it from a
 * UiInterimNote to a BizNoteNew or BizNote.
 */
module.exports = (req: NoteUpsertRequest): BizNoteNew => {
  const {
    body,
    user,
  } = (req);
  if (!body) {
    throw new Error('Missing body property from request in serverNoteValidator.');
  }
  if (!user) {
    throw new Error('Missing user property from request in serverNoteValidator.');
  }
  const { _id: userId } = user;
  if (!userId) {
    throw new Error('Missing userId property from user object in serverNoteValidator.');
  }

  const note = utils.noteFromBody(body);
  const transformed = noteValidator(note);

  const { date } = transformed;
  if (typeof date !== 'number') {
    throw new Error(`Invalid date ${date} in serverNoteValidation`);
  }

  const bizNote: BizNoteNew = {
    ...transformed,
    userId,
    date,
  };

  return bizNote;
};
