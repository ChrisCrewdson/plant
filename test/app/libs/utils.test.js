const utils = require('../../../app/libs/utils');
const constants = require('../../../app/libs/constants');
const moment = require('moment');
const seamless = require('seamless-immutable').static;

describe('/app/libs/utils', () => {
  describe('slugs', () => {
    test('should create a slug', () => {
      const given = '  I/am(a)slug  ';
      const actual = utils.makeSlug(given);
      const expected = 'i-am-a-slug';
      expect(actual).toBe(expected);
    });
  });

  describe('mongo', () => {
    test('should create a mongo id', () => {
      const mongoId = utils.makeMongoId();
      expect(mongoId.length).toBe(24);
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

    test('should create an Integer date from a string', () => {
      let actual = utils.dateToInt('1/1/2016');
      expect(actual).toBe(20160101);

      actual = utils.dateToInt('2/29/2016');
      expect(actual).toBe(20160229);

      actual = utils.dateToInt('12/31/2016');
      expect(actual).toBe(20161231);
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

    test('should not need to sort plants with missing plants', () => {
      const plantIds = seamless.from(['5', '1', '2', '5', '3', '4', '5']);
      const sortedPlantIds = utils.sortPlants(plantIds, plants);
      expect(sortedPlantIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedPlantIds).toBe(plantIds);
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

    test('should not need to sort notes with missing notes', () => {
      const noteIds = seamless.from(['5', '1', '2', '5', '3', '4', '5']);
      const sortedNoteIds = utils.sortNotes(noteIds, notes);
      expect(sortedNoteIds).toMatchSnapshot();
      // It should have returned the same object because it did
      // not need to get sorted.
      expect(sortedNoteIds).toBe(noteIds);
    });
  });
});
