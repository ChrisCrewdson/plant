// PlantRedux
// This file holds the specialized typings that apply to this project for Redux operations.

import { Action } from 'redux';
import { BizNote } from '../db/mongo/model-note';

/**
 * The Actions in Plant have 2 props:
 * type and payload
 * type is always a string so we can extend redux.Action for this.
 * payload can be anything
 */
export interface PlantAction<T = any> extends Action<string> {
    payload: T;
  }

export interface DeletePlantRequestPayload {
  locationId: string;
  plantId: string;
}

export interface UpsertNoteRequestPayload {
  note: BizNote;
  files?: File[];
}

export interface ChangeActiveLocationIdPayload {
  _id: string;
}
