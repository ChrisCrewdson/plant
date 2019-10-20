// PlantRedux
// This file holds the specialized typings that apply to this project for Redux operations.

import { Action } from 'redux';

/**
 * The Actions in Plant have 2 props:
 * type and payload
 * type is always a string so we can extend redux.Action for this.
 * payload can be anything
 */
export interface PlantAction<T = any> extends Action<string> {
    payload: T;
  }

export interface LoadLocationsSuccessAction extends PlantAction<UiLocationsValue[]> {}
