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
  { payload }: PlantAction<Readonly<UiInterimPlantContainer>>): UiInterim {
  let plant = (payload.plant || {}) as Readonly<UiPlantsValue>;
  return produce(state, (draft) => {
    if (Object.prototype.hasOwnProperty.call(plant, 'price')) {
      if (isNumber(plant.price)) {
        plant = {
          ...plant,
          price: plant.price.toString(),
        };
      }
    }
    draft.plant = { plant };
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
function editPlantChange(state: Readonly<UiInterim>,
  action: PlantAction<UiPlantsValue>): UiInterim {
  const { payload } = action;
  return produce(state, (draft) => {
    if (!draft.plant) {
      draft.plant = {
        plant: {} as UiPlantsValue,
      };
    }

    if (!draft.plant.plant) {
      draft.plant.plant = {} as UiPlantsValue;
    }

    const plant = draft.plant.plant as UiPlantsValue;

    draft.plant.plant = {
      ...plant,
      ...payload,
    };
  });
}

function loadPlantsRequest(state: Readonly<UiInterim>, action: AnyAction): UiInterim {
  return produce(state, (draft) => {
    draft.loadPlantRequest = action.payload;
  });
}

/**
 * After client receives a success/fail response from the load-plants request we can
 * delete the loadPlantRequest flag that indicates that this request is pending.
 * @param state - current/previous state
 */
const removePlantLoadPending = (
  state: Readonly<UiInterim>): Readonly<UiInterim> => produce(state, (draft) => {
  delete draft.loadPlantRequest;
});
const loadPlantsSuccess = removePlantLoadPending;
const loadPlantsFailure = removePlantLoadPending;

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
  action: PlantAction): UiInterim => {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  }

  return state;
};
