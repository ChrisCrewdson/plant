const React = require('react');
// const utils = require('../../../libs/utils');
const PropTypes = require('prop-types');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const { actionFunc } = require('../../../actions');

/**
 * @param {LastMeasuredProps} props
 */
function lastMeasured(props) {
  const {
    plantIds,
    plants,
    metricDates, // An array of metrics keys/props for with to find the most recent date
    dispatch,
  } = props;

  /** @type {string[]} */
  const initMissingPlants = [];

  // We need all the plants in this list to have had their notes loaded.
  // This is determined by the "notesRequested" flag on the plant object.
  const missingPlants = plantIds.reduce((acc, plantId) => {
    if (plants[plantId]) {
      return acc;
    }
    acc.push(plantId);
    return acc;
  }, initMissingPlants);

  if (missingPlants.length) {
    dispatch(actionFunc.loadUnloadedPlantsRequest(missingPlants));
  }

  /** @type {string[]} */
  const initMissingNotesPlantIds = [];

  const missingNotesPlantIds = plantIds.reduce((acc, plantId) => {
    const plant = plants[plantId];
    if (!plant || plant.notesRequested) {
      return acc;
    }
    acc.push(plantId);
    return acc;
  }, initMissingNotesPlantIds);

  if (missingNotesPlantIds.length) {
    dispatch(actionFunc.loadNotesRequest({
      plantIds: missingNotesPlantIds,
    }));
  }

  // Get an array with flattened metrics and their most recent date.
  /** @type {LastMetricDates[]} */
  const plantsWithLatestMetrics = plantIds.reduce((acc, plantId) => {
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

    /** @type {LastMetricDates} */
    const metricPlant = {
      plantId,
      title: plant.title,
    };

    // Now iterate through notes...
    (plant.notes || []).forEach((note) => {
      if (note.metrics) {
        Object.keys(note.metrics).forEach((metric) => {
          if (!metricPlant[metric] || metricPlant[metric] < note.date) {
            metricPlant[metric] = note.date;
          }
          if (metricDates.includes(metric)
            && (!metricPlant.lastDate || metricPlant.lastDate < note.date)) {
            metricPlant.lastDate = note.date;
          }
        });
      }
    });

    acc.push(metricPlant);
    return acc;
  }, /** @type {LastMetricDates[]} */ ([]));

  /** @type {LastMetricDates[]} */
  const sortedMetrics = seamless.asMutable(plantsWithLatestMetrics).sort(
    /**
     * @param {LastMetricDates} a
     * @param {LastMetricDates} b
     */
    (a, b) => {
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
    },
  );

  return (
    <div>
      <h5>
Metrics:
      </h5>
      <ul>
        {
          sortedMetrics.map(metricPlant => (
            <div key={metricPlant.plantId}>
              {metricPlant.title}
            </div>),
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

module.exports = lastMeasured;
