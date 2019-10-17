interface NavbarProps {

}

interface OpenGraphMeta {
  property: string;
  content: string;
}

interface ServerSideRenderData {
  html?: string;
  initialState?: PlantStateTree;
  og?: OpenGraphMeta[]; // Facebook Open Graph
  req: import('express').Request;
  title?: string;
}

interface PlantContext {
  store: PlantStore;
}

interface CancelSaveButtonsProps {
  clickAddPhoto: React.MouseEventHandler<{}>;
  clickCancel: React.MouseEventHandler<{}>;
  clickSave: React.MouseEventHandler<{}>;
  showButtons: boolean;
  mini?: boolean;
}

interface EditDeleteButtonsProps {
  clickDelete: Function;
  clickEdit: Function;
  confirmDelete: Function;
  confirmMsg?: string;
  deleteData?: object;
  deleteTitle: string;
  disabled?: boolean;
  mini?: boolean;
  showButtons: boolean;
  showDeleteConfirmation: boolean;
}

interface GridPropsColumn {
  options?: Record<string, string>; // Might not be right
  title: string;
  type: string;
  width: number;
}

interface GridPropsRow {
  _id: string;
  values: (string|boolean)[];
}

interface GridRowValidate {
  isNew?: boolean;
  meta?: object;
  row?: GridPropsRow;
}

interface GridProps {
  columns: GridPropsColumn[];
  delete: Function;
  insert: Function;
  meta?: object;
  rows?: GridPropsRow[];
  title: string;
  update: Function;
  validate: (data: GridRowValidate) => string[];
}

// TODO: This is probably a subset of GridProps - if so contruct that way
interface GridState {
  rows?: GridPropsRow[];
  errors?: string[];
  newRow?: boolean;
  editId?: string;
  deleteId?: string;
}

interface GridColumn {
  options?: Record<string, string>;
  title: string;
  type: string;
  width: number;
}

type PlantStateTreeProps =
  'interim' |
  'locations' |
  'notes' |
  'plants' |
  'user' |
  'users';

/**
 * A finite list of root properties in the Redux state tree for Plant
 */
interface PlantStateTree {
  interim: UiInterim;
  locations: UiLocations;
  notes: UiNotes;
  plants: UiPlants;
  user: UiUser;
  users: UiUsers;
}

declare type PlantStore = import('redux').Store<PlantStateTree>;

interface ProfilePropsUserSettings {
  imperial: boolean;
}

interface ProfileProps {
  userSettings: ProfilePropsUserSettings;
}

interface UsersProps {

}
