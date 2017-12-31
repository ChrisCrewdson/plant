const gis = require('../../../app/libs/gis');
const seamless = require('seamless-immutable').static;

describe('/app/libs/gis', () => {
  describe('scaling to canvas', () => {
    test('should scale zero plants', () => {
      const width = 700;
      const immutablePlants = seamless.from({});
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(seamless.isImmutable(scaledPlants.plants)).toBe(true);
      expect(scaledPlants).toMatchSnapshot();
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
      const immutablePlants = seamless.from(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(seamless.isImmutable(scaledPlants.plants)).toBe(true);
      expect(scaledPlants).toMatchSnapshot();
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
      const immutablePlants = seamless.from(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(seamless.isImmutable(scaledPlants.plants)).toBe(true);
      expect(scaledPlants).toMatchSnapshot();
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
      const immutablePlants = seamless.from(plants);
      const scaledPlants = gis.scaleToCanvas(immutablePlants, width);
      expect(seamless.isImmutable(scaledPlants.plants)).toBe(true);
      expect(scaledPlants).toMatchSnapshot();
    });
  });
});
