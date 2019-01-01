// The interim model is a data structure that is passed
// around in the UI only.
// It's purpose is to hold data that communicates changes
// that are happening in the UI that have not been
// persisted to other collections.
// For example, the editing of another model can be done
// by saving the changes in the interim model until the
// user Saves the changes.


/*
This state is WIP
{
  note: {
    note: {
      id: 'some-mongo-id',
      mode: 'new/update',
      fileUploadStatus: 'some string percent or object ??'
    },
    plant: {
      // expected props for a plant
    }
  }
}
*/

interface UiInterimUploadProgress {
  value: number;
  max: number;
  note?: UiNotesValue;
}

interface UiInterimNote {
  _id?: string;
  note: string;
  plant?: UiPlantsValue;
  isNew?: boolean;
  uploadProgress?: UiInterimUploadProgress;
  /**
   * At the time of writing this I think that date is sometimes a string. In the note.test.js
   * file there are validation tests that confirms that it's not a string.
   */
  date?: number;
  errors?: Dictionary<string>;
  plantIds: string[];
  metrics?: any; // TODO: Fix typing of metrics in UiInterimNote.
  images?: NoteImage[];
  userId?: string;
}

interface UiInterim {
  note?: UiInterimNote;
  plant?: UiPlantsValue;
  loadPlantRequest?: boolean;
}

interface UpsertNoteRequestPayload {
  note: UiInterimNote;
  files?: File[];
}