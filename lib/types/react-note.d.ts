
interface NoteAssocPlantProps {
  dispatch: import('redux').Dispatch;
  error: string;
  plantIds: string[];
  plants: Dictionary<UiPlantsValue>;
}

interface NoteAssocPlantState {
  expanded: boolean;
  filter: string;
}

interface INoteAssocPlant extends React.Component<NoteAssocPlantProps, NoteAssocPlantState> {
}

interface NoteAssocPlantToggleButtonProps {
  _id: string;
  label: React.ReactNode;
  primary: boolean;
  secondary: boolean;
  style: React.CSSProperties;
  toggleFunc: (id: string) => void;
}

