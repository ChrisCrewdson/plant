
interface NoteAssocPlantProps {
  dispatch: Function;
  error: String;
  plantIds: String[];
  plants: Object;
}

interface NoteAssocPlantToggleButtonProps {
  _id: string;
  label: string;
  primary: boolean;
  secondary: boolean;
  style: object;
  toggleFunc: Function;
}
