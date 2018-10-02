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

interface UiInterimNote {
  note: UiNotesValue;
  plant?: UiPlantsValue;
}

interface UiInterim {
  note?: UiInterimNote;
  plant?: UiPlantsValue;
}
