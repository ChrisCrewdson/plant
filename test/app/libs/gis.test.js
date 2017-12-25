const gis = require('../../../app/libs/gis');
const seamless = require('seamless-immutable').static;

describe('/app/libs/gis', () => {
  describe('scaling to canvas', () => {
    test('should scale zero plants', () => {
      const width = 700;
      const immutablePlants = Immutable.Map();
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(Immutable.Map.isMap(scaledPlants.plants)).toBe(true);
      expect(scaledPlants.plants.size).toBe(0);
      expect(scaledPlants.canvasHeight).toBe(0);
    });

    test('should scale a single plant', () => {
      const plants = {
        1: {
          _id: '1',
          title: 'Title 1',
          loc: {
            coordinates: [10, 20],
          },
        },
      };
      const width = 700;
      const immutablePlants = Immutable.fromJS(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(Immutable.Map.isMap(scaledPlants.plants)).toBe(true);
      expect(scaledPlants.plants.size).toBe(1);
      expect(scaledPlants.canvasHeight).toBe(width);
    });

    test('should scale two plants on the same latitude', () => {
      const plants = {
        1: {
          _id: '1',
          title: 'Title 1',
          loc: {
            coordinates: [10, 20],
          },
        },
        2: {
          _id: '2',
          title: 'Title 2',
          loc: {
            coordinates: [11, 20],
          },
        },
      };
      const width = 700;
      const immutablePlants = Immutable.fromJS(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(Immutable.Map.isMap(scaledPlants.plants)).toBe(true);
      expect(scaledPlants.plants.size).toBe(2);
      expect(scaledPlants.canvasHeight).toBe(width);
    });

    test('should scale two plants on the same longitude', () => {
      const plants = {
        1: {
          _id: '1',
          title: 'Title 1',
          loc: {
            coordinates: [10, 20],
          },
        },
        2: {
          _id: '2',
          title: 'Title 2',
          loc: {
            coordinates: [10, 21],
          },
        },
      };
      const width = 700;
      const immutablePlants = Immutable.fromJS(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(Immutable.Map.isMap(scaledPlants.plants)).toBe(true);
      expect(scaledPlants.plants.size).toBe(2);
      expect(scaledPlants.canvasHeight).toBe(width);
    });
  });
});
