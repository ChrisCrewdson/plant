
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
