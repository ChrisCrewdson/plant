// The most difficult part of creating this module was naming it.
// "interim" is the least worst of all the bad names I came up with.

import { produce } from 'immer';
import { isNumber } from 'lodash';
import { AnyAction } from 'redux';
import { actionEnum } from '../actions';
import { PlantAction } from '../../lib/types/redux-payloads';

function editNoteOpen(state: Readonly<UiInterim>,
  action: PlantAction<UiInterimNoteContainer>): UiInterim {
  return produce(state, (draft) => {
    draft.note = action.payload;
  });
}

function editNoteClose(state: Readonly<UiInterim>): UiInterim {
  // Just remove note element if editing is canceled
  // or if the note has been saved
  return produce(state, (draft) => {
    delete draft.note;
  });
}

/**
 * editNoteChange
 * action.payload:
 * {note-key: note-value, ...}
 * state:
 *   note:
 *     note,
 *     plant
 */
function editNoteChange(state: Readonly<UiInterim>, action: PlantAction<UiInterimNote>): UiInterim {
  return produce(state, (draft) => {
    const noteNoteUpdate = action.payload;

    if (!draft.note) {
      draft.note = {
        note: noteNoteUpdate,
        plant: {} as UiPlantsValue,
      };
      return;
    }

    const note = {
      ...(draft.note || {}).note,
      ...action.payload,
    };

    draft.note.note = note;
  });
}

// action.payload:
// {plant}
function editPlantOpen(state: Readonly<UiInterim>,
  { payload }: PlantAction<UiInterimPlantContainer>): UiInterim {
  const plant = payload.plant || {} as UiPlantsValue;
  return produce(state, (draft) => {
    draft.plant = { plant };
    if (Object.prototype.hasOwnProperty.call(plant, 'price')) {
      draft.plant.plant.price = isNumber(plant.price) ? plant.price.toString() : plant.price;
    }
  });
}

/**
 * action.payload is empty
 */
function editPlantClose(state: Readonly<UiInterim>): UiInterim {
  // Just remove plant element if editing is canceled
  // or if the plant has been saved
  return produce(state, (draft) => {
    delete draft.plant;
  });
}

/**
 * action.payload:
 * {plant-key: plant-value, ...}
 * state:
 *   plant:
 *     plant
 */
function editPlantChange(state: Readonly<UiInterim>, action: AnyAction): UiInterim {
  return produce(state, (draft) => {
    const plant = {
      ...(draft.plant || {}).plant,
      ...action.payload,
    };
    draft.plant = {
      ...draft.plant,
      plant,
    };
  });
}

function loadPlantsRequest(state: Readonly<UiInterim>, action: AnyAction): UiInterim {
  return produce(state, (draft) => {
    draft.loadPlantRequest = action.payload;
  });
}

function loadPlantsSuccess(state: Readonly<UiInterim>): UiInterim {
  return produce(state, (draft) => {
    delete draft.loadPlantRequest;
  });
}

function loadPlantsFailure(state: Readonly<UiInterim>): UiInterim {
  return produce(state, (draft) => {
    delete draft.loadPlantRequest;
  });
}

// This is only exported for testing
export const reducers = {
  // Init the note prop in the interim state with something
  // so that the note is editable
  [actionEnum.EDIT_NOTE_OPEN]: editNoteOpen,
  [actionEnum.EDIT_NOTE_CHANGE]: editNoteChange,
  [actionEnum.EDIT_NOTE_CLOSE]: editNoteClose,
  [actionEnum.EDIT_PLANT_OPEN]: editPlantOpen,
  [actionEnum.EDIT_PLANT_CHANGE]: editPlantChange,
  [actionEnum.EDIT_PLANT_CLOSE]: editPlantClose,
  [actionEnum.LOAD_PLANTS_REQUEST]: loadPlantsRequest,
  [actionEnum.LOAD_PLANTS_SUCCESS]: loadPlantsSuccess,
  [actionEnum.LOAD_PLANTS_FAILURE]: loadPlantsFailure,
};

const defaultState = produce({}, () => ({}));

export const interim = (state: Readonly<UiInterim> = defaultState,
  action: PlantAction<any>): UiInterim => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
