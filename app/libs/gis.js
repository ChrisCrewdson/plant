const constants = require('./constants');

const { gisMultiplier } = constants;

function scaleToCanvas(immutablePlants, width) {
  if (!immutablePlants.size) {
    return {
      plants: immutablePlants,
      canvasHeight: 0,
    };
  }

  const minMax = immutablePlants.reduce((acc, plant) => {
    const long = plant.getIn(['loc', 'coordinates', '0']);
    const lat = plant.getIn(['loc', 'coordinates', '1']);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(long) || isNaN(lat)) {
      // console.warn(`NaN found in getting min/max of long/lat ${long} / ${lat}`);
    } else {
      acc.long.min = Math.min(acc.long.min, long);
      acc.long.max = Math.max(acc.long.max, long);
      acc.lat.min = Math.min(acc.lat.min, lat);
      acc.lat.max = Math.max(acc.lat.max, lat);
    }
    return acc;
  }, { long: { min: 180, max: -180 }, lat: { min: 90, max: -90 } });

  minMax.long.min = Math.round(minMax.long.min * gisMultiplier);
  minMax.long.max = Math.round(minMax.long.max * gisMultiplier);
  minMax.lat.min = Math.round(minMax.lat.min * gisMultiplier);
  minMax.lat.max = Math.round(minMax.lat.max * gisMultiplier);

  const canvasMin = 50;
  // Take x pixels off each side.
  const canvasWidth = width - (canvasMin * 2);
  let actualWidth = minMax.long.max - minMax.long.min;
  let actualHeight = minMax.lat.max - minMax.lat.min;
  if (actualWidth === 0 && actualHeight === 0) {
    // 1000 is about 10 metres I think
    actualWidth = 1000;
    actualHeight = 1000;
    minMax.long.max += 500;
    minMax.long.min -= 500;
    minMax.lat.max += 500;
    minMax.lat.min -= 500;
  } else if (actualWidth === 0) {
    actualWidth = actualHeight;
  } else if (actualHeight === 0) {
    actualHeight = actualWidth;
  }

  const heightWidthRatio = actualHeight / actualWidth;
  const canvasHeight = heightWidthRatio * width;

  const plants = immutablePlants.map((plant) => {
    const long = Math.round(plant.getIn(['loc', 'coordinates', '0']) * gisMultiplier);
    const ratioFromMinLong = (long - minMax.long.min) / actualWidth;
    const x = (canvasWidth * ratioFromMinLong) + canvasMin;

    const lat = Math.round(plant.getIn(['loc', 'coordinates', '1']) * gisMultiplier);
    const ratioFromMinLat = (lat - minMax.lat.min) / actualHeight;
    const y = ((heightWidthRatio * (canvasWidth * ratioFromMinLat)) + canvasMin);

    const title = plant.get('title');
    const _id = plant.get('_id');
    return {
      _id, title, x, y,
    };
  });
  return {
    plants,
    canvasHeight,
  };
}

module.exports = {
  scaleToCanvas,
};

