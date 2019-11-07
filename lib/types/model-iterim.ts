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

/*
In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export
is considered a module. Conversely, a file without any top-level import or export declarations
is treated as a script whose contents are available in the global scope (and therefore to
modules as well).
*/

interface UiInterimNoteContainer {
  note: UiInterimNote;
  plant: UiPlantsValue;
}

interface UiInterimPlantContainer {
  plant: UiPlantsValue;
}

interface UiInterim {
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
