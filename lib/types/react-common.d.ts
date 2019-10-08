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

declare type InputComboTextPropsType = 'text' | 'number';

interface InputComboTextProps {
  // changeHandler: (e: React.FormEvent<{}>, newValue: string) => void;
  changeHandler: (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: InputComboTextPropsType;
  value: string | number;
}

declare type InputComboPropsType = 'text' | 'number' | 'boolean';

interface InputComboProps {
  changeHandler: (e: React.ChangeEvent<HTMLInputElement>, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder?: string;
  style?: React.CSSProperties;
  type?: InputComboPropsType;
  value: string | number | boolean;
  options?: Record<string, string>;
}

interface SelectComboProps {
  changeHandler: (e: React.SyntheticEvent<{}>, index: number, menuItemValue: any) => void;
  // changeHandler: (e: React.FormEvent<{}>, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  value: string | number | boolean;
  options?: Record<string, string>;
}

declare type GridCellInputType = 'select' | 'boolean' | 'text';

interface GridCellProps {
  editCell: (rowId: string, colIndex: number, value: string|boolean) => void;
  editId?: string;
  error: string;
  index: number;
  options?: Record<string, string>;
  rowId: string;
  title: string;
  type: GridCellInputType;
  value: string|boolean;
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

interface RemoveConfirmProps {
  confirmFn: Function;
  confirmMsg: string;
  deleteData?: object;
  mini: boolean;
  title?: string;
}

interface MarkdownProps {
  markdown: string;
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
