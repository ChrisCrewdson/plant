
interface NoteAssocPlantProps {
  dispatch: import('redux').Dispatch;
  error: string;
  plantIds: string[];
  plants: Record<string, UiPlantsValue>;
}

interface NoteAssocPlantState {
  expanded: boolean;
  filter: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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

interface NoteCreateProps {
  dispatch: import('redux').Dispatch;
  userCanEdit: boolean;
  interimNote: UiInterimNote;
  plant: UiPlantsValue;
  plants: UiPlants;
  locationId: string;
}

declare type MetricDate = 'height' | 'girth' | 'harvestCount' | 'harvestEnd';

interface LastMeasuredProps {
  plantIds: string[];
  plants: UiPlants;
  metricDates: MetricDate[];
  dispatch: import('redux').Dispatch;
 }

interface LastMetricDates {
  plantId: string;
  title: string;
  lastDate?: Date;
  height?: Date;
  girth?: Date;
  harvestCount?: Date;
  harvestEnd?: Date;
}

interface LoadNotesRequestPayload {
  plantIds?: string[];
  noteIds?: string[];
}
