const moment = require('moment');
// @ts-ignore - static hasn't been defined on seamless types yet.
const seamless = require('seamless-immutable').static;
const utils = require('../../../app/libs/utils');
const constants = require('../../../app/libs/constants');

describe('/app/libs/utils', () => {
  describe('slugs', () => {
    test('should create a slug', () => {
      const given = '  I/am(a)slug  ';
      const actual = utils.makeSlug(given);
      const expected = 'i-am-a-slug';
      expect(actual).toBe(expected);
    });
  });

  describe('URLs', () => {
    test('that makeLocationUrl creates a url', () => {
      const url = utils.makeLocationUrl({ title: 'I Am A Title', _id: 'l-1' });
      expect(url).toBe('/location/i-am-a-title/l-1');
    });

    test('that makeLayoutUrl creates a url', () => {
      const url = utils.makeLayoutUrl({ title: 'I Am A Title', _id: 'l-1' });
      expect(url).toBe('/layout/i-am-a-title/l-1');
    });
  });

  describe('mongo', () => {
    test('should create a mongo id', () => {
      const mongoId = utils.makeMongoId();
      expect(mongoId).toHaveLength(24);
      expect(mongoId).not.toContain('-');
      expect(typeof mongoId).toBe('string');
      expect(constants.mongoIdRE.test(mongoId)).toBe(true);
    });
  });

  describe('dateToInt()', () => {
    test('should create an Integer date from moment object', () => {
      let actual = utils.dateToInt(moment(new Date('1/1/2016')));
      expect(actual).toBe(20160101);

      actual = utils.dateToInt(moment(new Date('2/29/2016')));
      expect(actual).toBe(20160229);

      actual = utils.dateToInt(moment(new Date('12/31/2016')));
      expect(actual).toBe(20161231);
    });

    test('should create an Integer date from date object', () => {
      let actual = utils.dateToInt(new Date('1/1/2016'));
      expect(actual).toBe(20160101);

      actual = utils.dateToInt(new Date('2/29/2016'));
      expect(actual).toBe(20160229);

      actual = utils.dateToInt(new Date('12/31/2016'));
      expect(actual).toBe(20161231);
    });

    test('should create an Integer date from a string', () => {
      let actual = utils.dateToInt('1/1/2016');
      expect(actual).toBe(20160101);

      actual = utils.dateToInt('2/29/2016');
      expect(actual).toBe(20160229);

      actual = utils.dateToInt('12/31/2016');
      expect(actual).toBe(20161231);

      actual = utils.dateToInt('13/02/1987');
      expect(actual).toBeNaN();
    });

    test('should return an Integer date from an Integer', () => {
      let actual = utils.dateToInt(20160101);
      expect(actual).toBe(20160101);

      actual = utils.dateToInt(20160229);
      expect(actual).toBe(20160229);
    });

    test('should throw and Error for an unknown type', (done) => {
      try {
        utils.dateToInt({});
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('dateToInt([object Object])');
        done();
      }
    });
  });

  describe('intToDate()', () => {
    test('should create a Date from an Integer', () => {
      function compareDates(act, exp) {
        expect(act.toString()).toBe(exp.toString());
      }

      let actual = utils.intToDate(20160101);
      let expected = new Date(2016, 0, 1);
      compareDates(actual, expected);

      actual = utils.intToDate(20160229);
      expected = new Date(2016, 1, 29);
      compareDates(actual, expected);

      actual = utils.intToDate(20161231);
      expected = new Date(2016, 11, 31);
      compareDates(actual, expected);
    });
  });

  describe('intToString()', () => {
    test('should create a String from an Integer date', () => {
      const actual = utils.intToString(20160101);
      expect(actual).toBe('01/01/2016');
    });
  });

  describe('plantFromBody', () => {
    test('that a plant is created from a body', () => {
      const body = {
        plantedDate: '20160505',
        purchasedDate: '20160404',
        terminatedDate: '20170228',
        isTerminated: 'true',
      };
      const actual = utils.plantFromBody(body);
      expect(actual).toMatchSnapshot();
    });
  });

  describe('filterPlants', () => {
    test('that plants are filtered', () => {
      const plantIds = seamless.from(['p-1', 'p-2', 'p-3']);
      const plants = {
        'p-1': {
          title: 'GoLden',
        },
        'p-2': {},
      };
      const filter = 'gOlD';
      const actual = utils.filterPlants(plantIds, plants, filter);
      expect(actual).toEqual(['p-1']);
    });

    test('that plants are not filtered if no filter text', () => {
      const plantIds = seamless.from(['p-1', 'p-2', 'p-3']);
      const plants = {
        'p-1': {
          title: 'GoLden',
        },
        'p-2': {},
      };

      const actual = utils.filterPlants(plantIds, plants);
      expect(actual).toBe(plantIds);
    });
  });

  describe('rebaseLocations', () => {
    test('should rebase the locations', () => {
      const plants = [{
        _id: '1',
        loc: { coordinates: [5.5, 10.1] },
      }, {
        _id: '2',
        loc: { coordinates: [15.15, 35.35] },
      }, {
        _id: '3',
        loc: { coordinates: [10.1, 4.4] },
      }];
      const rebased = utils.rebaseLocations(plants);
      expect(rebased[0].loc.coordinates[0]).toBe(0);
      expect(rebased[0].loc.coordinates[1]).toBe(5.7);
      expect(rebased[1].loc.coordinates[0]).toBe(9.65);
      expect(rebased[1].loc.coordinates[1]).toBe(30.95);
      expect(rebased[2].loc.coordinates[0]).toBe(4.6);
      expect(rebased[2].loc.coordinates[1]).toBe(0);
    });

    test('should return plants if plants is an empty array', () => {
      const plants = [];
      const actual = utils.rebaseLocations(plants);
      expect(actual).toBe(plants);
    });

    test('should return undefined if plants is undefined', () => {
      const actual = utils.rebaseLocations();
      expect(actual).toBeUndefined();
    });
  });

  describe('metrics', () => {
    test('should prepare note body and remove unknown metrics', () => {
      const body = {
        date: '20160101',
        metrics: {
          height: '15.5',
          harvestCount: '32',
          harvestStart: 'true',
          invalidProp: '66',
        },
      };
      const actual = utils.noteFromBody(body);
      const expected = {
        date: 20160101,
        metrics: {
          height: 15.5,
          harvestCount: 32,
          harvestStart: true,
        },
      };
      // I'm torn between which of these paradigms below to follow.
      // 1. Jest will remove the need for the expected object above.
      // 2. toEqual() shows me the expected here in the code.
      expect(actual).toMatchSnapshot();
      expect(actual).toEqual(expected);
    });

    test('should prepare note body and remove invalid metrics', () => {
      const body = {
        date: '20160101',
        metrics: {
          height: 'invalid float',
          harvestCount: 'invalid number',
          harvestStart: 'anything not "true" should be removed',
        },
      };
      const actual = utils.noteFromBody(body);
      const expected = {
        date: 20160101,
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('constantEquals', () => {
    test('should fail if user supplied is longer than internal', () => {
      expect(utils.constantEquals('123', '12')).toBe(false);
    });
    test('should fail if user supplied is shorter than internal', () => {
      expect(utils.constantEquals('12', '123')).toBe(false);
    });
    test('should fail if 1st param is not a string', () => {
      expect(utils.constantEquals(123, '123')).toBe(false);
    });
    test('should fail if 2nd param is not a string', () => {
      expect(utils.constantEquals('123', 123)).toBe(false);
    });
    test(
      'should fail if 1st and 2nd params are equal length and not the same',
      () => {
        expect(utils.constantEquals('123', '124')).toBe(false);
      },
    );
    test('should pass if 1st and 2nd are equal', () => {
      expect(utils.constantEquals('123', '123')).toBe(true);
    });
  });

  describe('sortPlants', () => {
    const plants = {
      1: {
        title: 'A',
      },
      2: {
        title: 'B',
      },
      3: {
        title: 'B',
      },
      4: {
        title: 'C',
      },
    };

    test('should return plantIds if array is empty', () => {
      const plantIds = seamless.from([]);
      expect(utils.sortPlants(plantIds)).toBe(plantIds);
    });

    test('should return an array if param is falsy', () => {
      expect(utils.sortPlants()).toEqual([]);
    });

    test('should sort plants', () => {
      const plantIds = seamless.from(['4', '1', '3', '2']);
      const sortedPlantIds = utils.sortPlants(plantIds, plants);
      expect(sortedPlantIds).toMatchSnapshot();
      expect(sortedPlantIds).not.toBe(plantIds);
    });

    test('should not need to sort plants', () => {
      const plantIds = seamless.from(['1', '2', '3', '4']);
      const sortedPlantIds = utils.sortPlants(plantIds, plants);
      expect(sortedPlantIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedPlantIds).toBe(plantIds);
    });

    test('should not need to sort plants with missing plants at end', () => {
      const plantIds = seamless.from(['1', '2', '3', '4', '5', '5', '5']);
      const sortedPlantIds = utils.sortPlants(plantIds, plants);
      expect(sortedPlantIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedPlantIds).toBe(plantIds);
    });

    test('should sort plants with missing plants', () => {
      const plantIds = seamless.from(['4', '7', '6', '2', '6', '3', '1', '9']);
      const sortedPlantIds = utils.sortPlants(plantIds, plants);
      expect(sortedPlantIds).toMatchSnapshot();
      const expectedOrder = ['1', '2', '3', '4', '7', '6', '6', '9'];
      expect(sortedPlantIds).toEqual(expectedOrder);
      // It should not have returned the same object because it did
      // not need to get sorted.
      expect(sortedPlantIds).not.toBe(plantIds);
    });
  });

  describe('sortNotes', () => {
    const notes = {
      1: {
        date: 10,
      },
      2: {
        date: 20,
      },
      3: {
        date: 20,
      },
      4: {
        date: 30,
      },
    };

    test('should return noteIds if array is empty', () => {
      const noteIds = seamless.from([]);
      expect(utils.sortNotes(noteIds)).toBe(noteIds);
    });

    test('should return an array if param is falsy', () => {
      expect(utils.sortNotes()).toEqual([]);
    });

    test('should sort notes', () => {
      const noteIds = seamless.from(['4', '1', '3', '2']);
      const sortedNoteIds = utils.sortNotes(noteIds, notes);
      expect(sortedNoteIds).toMatchSnapshot();
      expect(sortedNoteIds).not.toBe(noteIds);
    });

    test('should not need to sort notes', () => {
      const noteIds = seamless.from(['1', '2', '3', '4']);
      const sortedNoteIds = utils.sortNotes(noteIds, notes);
      expect(sortedNoteIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedNoteIds).toBe(noteIds);
    });

    test('should not need to sort notes with missing notes at end', () => {
      const noteIds = seamless.from(['1', '2', '3', '4', '5', '5', '5']);
      const sortedNoteIds = utils.sortNotes(noteIds, notes);
      expect(sortedNoteIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedNoteIds).toBe(noteIds);
    });

    test('should sort notes with missing notes', () => {
      const noteIds = seamless.from(['4', '7', '6', '2', '6', '3', '1', '9']);
      const sortedNoteIds = utils.sortNotes(noteIds, notes);
      expect(sortedNoteIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedNoteIds).not.toBe(noteIds);
    });
  });

  describe('filterSortPlants', () => {
    test('that plants are both filtered and sorted by title', () => {
      const plantIds = ['missing', '4', '3', '2', '1'];
      const plants = {
        1: { title: '1. Golden' },
        2: { title: '2. Gold' },
        3: { title: '3. Fish' },
        4: { title: '4. Gol' },
      };
      const filter = 'gOLD';
      const actual = utils.filterSortPlants(plantIds, plants, filter);
      expect(actual).toMatchSnapshot();
      expect(actual).not.toBe(plantIds);
      expect(actual).toEqual(['1', '2']);
    });
  });

  describe('plantStats', () => {
    test('that plantStats creates a reasonable result', () => {
      const plantIds = ['missing', '4', '3', '2', '1'];
      const plants = {
        1: { isTerminated: true },
        2: { isTerminated: false },
        3: { isTerminated: false },
        4: { isTerminated: true },
      };
      const actual = utils.plantStats(plantIds, plants);
      expect(actual).toMatchSnapshot();
      expect(actual).not.toBe(plantIds);
    });
  });

  describe('hasGeo', () => {
    test('that window.navigator.geolocation exists', () => {
      window.navigator.geolocation = true;
      expect(utils.hasGeo()).toBe(true);
    });

    test('that window.navigator.geolocation does not exists', () => {
      window.navigator.geolocation = undefined;
      expect(utils.hasGeo()).toBe(false);
    });
  });

  describe('getGeo', () => {
    test('that getGeo returns an error if not supported', (done) => {
      utils.getGeo({}, (err) => {
        expect(err).toBe('This device does not have geolocation available');
        done();
      });
    });

    test('that getGeo returns a result', (done) => {
      const expected = {
        type: 'Point',
        coordinates: [1, 2],
      };

      window.navigator.geolocation = {
        getCurrentPosition: (cb) => {
          cb({
            coords: {
              longitude: 1,
              latitude: 2,
            },
          });
        },
      };

      utils.getGeo({}, (err, geo) => {
        expect(err).toBeFalsy();
        expect(geo).toEqual(expected);
        done();
      });
    });

    test('should return a fake timeout error', (done) => {
      // PERMISSION_DENIED (numeric value 1)
      // POSITION_UNAVAILABLE (numeric value 2)
      // TIMEOUT (numeric value 3)
      const positionError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
      };

      window.navigator.geolocation = {
        getCurrentPosition: (cb, errCb) => {
          errCb(positionError);
        },
      };

      utils.getGeo({}, (err) => {
        expect(err).toBe(positionError);
        done();
      });
    });
  });

  describe('metaMetricsGetByKey', () => {
    test('should get a meta metrics key', () => {
      const actual = utils.metaMetricsGetByKey('harvestCount');
      // The 3rd item in the array is harvestCount
      expect(actual).toBe(utils.metaMetrics[2]);
    });
  });

  describe('showFeature', () => {
    test('should not show feature if no user', () => {
      expect(utils.showFeature()).toBe(false);
    });

    test('should not show feature if user._id is missing', () => {
      expect(utils.showFeature({})).toBe(false);
    });

    test('should not show feature if user._id is not listed', () => {
      expect(utils.showFeature({
        _id: '1',
      })).toBe(false);
    });

    test('should show feature if user._id is listed', () => {
      expect(utils.showFeature({
        _id: '57b4e90d9f0e4e114b44bcf8',
      })).toBe(true);
    });
  });
});
