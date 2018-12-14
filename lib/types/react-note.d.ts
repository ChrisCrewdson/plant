
interface NoteAssocPlantProps {
  dispatch: Function;
  error: String;
  plantIds: String[];
  plants: Object;
}

interface NoteAssocPlantState {
  expanded: boolean;
  filter: string;
}

interface INoteAssocPlant extends React.Component<NoteAssocPlantProps, NoteAssocPlantState> {
}

interface NoteAssocPlantToggleButtonProps {
  _id: string;
  label: string;
  primary: boolean;
  secondary: boolean;
  style: object;
  toggleFunc: Function;
}

