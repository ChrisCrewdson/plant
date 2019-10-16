
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
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
