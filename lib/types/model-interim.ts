import { UiInterimNote } from '../db/mongo/model-note';

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

export interface UiInterimNoteContainer {
  note: UiInterimNote;
  plant: UiPlantsValue;
}

export interface UiInterimPlantContainer {
  plant: UiPlantsValue;
}

export interface UiInterim {
  note?: UiInterimNoteContainer;
  plant?: UiInterimPlantContainer;
  /**
   * This is a flag that is set to true when a request is sent from the client
   * to the server for a collection of plants at a location. Once a success/fail
   * is received back this prop is deleted. i.e.:
   * true: request to server pending
   * undefined: no request pending
   */
  loadPlantRequest?: boolean;
}
