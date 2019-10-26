import React from 'react';
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { Dispatch } from 'redux';
import { actionFunc } from '../../../actions';
import { PlantAction } from '../../../../lib/types/redux-payloads';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export type MetricDate = 'height' | 'girth' | 'harvestCount' | 'harvestEnd';

interface LastMetricDates {
  plantId: string;
  title: string;
  lastDate?: Date;
  height?: Date;
  girth?: Date;
  harvestCount?: Date;
  harvestEnd?: Date;
}

interface LastMeasuredProps {
  plantIds: string[];
  plants: UiPlants;
  metricDates: MetricDate[];
  dispatch: Dispatch<PlantAction<any>>;
}

export default function lastMeasured(props: LastMeasuredProps) {
  const {
    plantIds,
    plants,
    metricDates, // An array of metrics keys/props for with to find the most recent date
    dispatch,
  } = props;

  // We need all the plants in this list to have had their notes loaded.
  // This is determined by the "notesRequested" flag on the plant object.
  const missingPlants = plantIds.reduce((acc: string[], plantId) => {
    if (plants[plantId]) {
      return acc;
    }
    acc.push(plantId);
    return acc;
  }, []);

  if (missingPlants.length) {
    dispatch(actionFunc.loadUnloadedPlantsRequest(missingPlants));
  }

  const missingNotesPlantIds = plantIds.reduce((acc: string[], plantId) => {
    const plant = plants[plantId];
    if (!plant || plant.notesRequested) {
      return acc;
    }
    acc.push(plantId);
    return acc;
  }, []);

  if (missingNotesPlantIds.length) {
    dispatch(actionFunc.loadNotesRequest({
      plantIds: missingNotesPlantIds,
    }));
  }

  // Get an array with flattened metrics and their most recent date.
  const plantsWithLatestMetrics: LastMetricDates[] = plantIds.reduce(
    (acc: LastMetricDates[], plantId) => {
      const plant = plants[plantId];
      if (!plant) {
        return acc;
      }

      // Build an object that looks like this. All the metrics have the last entered
      // date value on them:
      //
      // plantId:
      // title:
      // lastDate: Date Object with most recent date of interested metric
      // height: 2/2/2018
      // girth: 1/2/2018
      // harvestCount: 6/7/2016
      // harvestEnd: 6/7/2016

      const metricPlant: LastMetricDates = {
        plantId,
        title: plant.title,
      };

      // Now iterate through notes...
      (plant.notes || []).forEach((note) => {
        // @ts-ignore - TODO - return to this and fix it
        if (note.metrics) {
          // @ts-ignore - TODO - return to this and fix it
          Object.keys(note.metrics).forEach((metric) => {
          // @ts-ignore - TODO - return to this and fix it
            if (!metricPlant[metric] || metricPlant[metric] < note.date) {
            // @ts-ignore - TODO - return to this and fix it
              metricPlant[metric] = note.date;
            }
            // @ts-ignore - TODO - return to this and fix it
            if (metricDates.includes(metric)
            // @ts-ignore - TODO - return to this and fix it
            && (!metricPlant.lastDate || metricPlant.lastDate < note.date)) {
            // @ts-ignore - TODO - return to this and fix it
              metricPlant.lastDate = note.date;
            }
          });
        }
      });

      acc.push(metricPlant);
      return acc;
    }, []);

  const sortedMetrics: ReadonlyArray<LastMetricDates> = produce(
    plantsWithLatestMetrics, (draft) => {
      draft.sort((a: LastMetricDates, b: LastMetricDates) => {
      // TODO: Move to utils module and write tests around this.
        if (a.lastDate && b.lastDate) {
          if (a.lastDate.valueOf() === b.lastDate.valueOf()) {
            return 0;
          }
          return a.lastDate.valueOf() > b.lastDate.valueOf() ? 1 : -1;
        }

        if (!a.lastDate && !b.lastDate) {
          return 0;
        }
        if (!a.lastDate && b.lastDate) {
          return -1;
        }
        // if (a.lastDate && !b.lastDate) {
        return 1;
      // }
      });
    });

  return (
    <div>
      <h5>
Metrics:
      </h5>
      <ul>
        {
          sortedMetrics.map((metricPlant) => (
            <div key={metricPlant.plantId}>
              {metricPlant.title}
            </div>
          ),
          )
        }
      </ul>
    </div>
  );
}

lastMeasured.propTypes = {
  plantIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  plants: PropTypes.shape({}).isRequired,
  metricDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatch: PropTypes.func.isRequired,
};
