interface UiAction {
  payload: any;
  type: string;
}

interface UiActions {
  // TODO: Should we split out the action object into two objects. One with string values
  // and the other with functions. It will make typing more specific and be cleaner in the
  // code.
  [action: string]: Function | string;
}
