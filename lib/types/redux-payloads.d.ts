import * as redux from 'redux';

declare namespace PlantActions {
  /**
   * The Actions in Plant only have 2 props:
   * type and payload
   * type is always a string so we can extend redux.Action for this.
   * payload can be anything
   */
  interface PlantAction<T = any> extends redux.Action<string> {
    payload: T;
  }

  interface LoadLocationsSuccessAction extends PlantAction<UiLocationsValue[]> {}
}

export = PlantActions
export as namespace PlantActions
