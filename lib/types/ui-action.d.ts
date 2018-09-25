interface UiAction {
  payload: any;
  type: string;
}

interface UiActions {
  [action: string]: Function | string;
}
