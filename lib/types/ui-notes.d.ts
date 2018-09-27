
// new = created in UI but not saved yet
// saved = upsertNoteSuccess has been received
// error = an error happened saving / validating etc.
// deleted = ajax request to delete object not complete yet
declare type UiNotesMetaState =
'new' |
'saved' |
'error' |
'deleted';

interface UiNotesMeta {
  state: UiNotesMetaState;
  errors: Array<string>;
}

interface UiNotesValue {
  _id: string;
  meta: UiNotesMeta;
  date: number;
  plantIds: Array<string>;
  userId: string;
  showImages?: boolean;
}

interface UiNotes {
  [id: string]: UiNotesValue;
}

/*
Object of notes:
{
  <mongoId>: {
    meta: {
      // new = created in UI but not saved yet
      // saved = upsertNoteSuccess has been received
      // error = an error happened saving / validating etc.
      // deleted = ajax request to delete object not complete yet
      state: 'new',
      errors: 'an array of errors'
    },
    _id: 'mongoId - same as key'
    date: 20160101 - a number,
    note: 'string',
    plantIds: 'an array of strings',
    userId: 'mongoId - identifies user',
    showImages: true/undefined
  }
}
*/