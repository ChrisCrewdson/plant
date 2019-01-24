// PlantRedux
// This file holds the specialized typings that apply to this project for Redux operations.

import * as redux from 'redux';

declare namespace PlantRedux {
  /**
   * The Actions in Plant have 2 props:
   * type and payload
   * type is always a string so we can extend redux.Action for this.
   * payload can be anything
   */
  interface PlantAction<T = any> extends redux.Action<string> {
    payload: T;
  }

  interface LoadLocationsSuccessAction extends PlantAction<UiLocationsValue[]> {}
}

export = PlantRedux
export as namespace PlantRedux
