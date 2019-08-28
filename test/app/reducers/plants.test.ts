export {}; // To get around: Cannot redeclare block-scoped variable .ts(2451)

const _ = require('lodash');
const seamless = require('seamless-immutable').static;
const plants = require('../../../app/reducers/plants');
const { actionFunc } = require('../../../app/actions');

describe('/app/reducers/plants', () => {
  describe('similar methods', () => {
    const methods = [
      'createPlantRequest',
      'createPlantFailure',
      'deletePlantFailure',
      'updatePlantFailure',
      'updatePlantRequest',
      'loadPlantFailure',
    ];

    test('should reduce using replace in place', () => {
      const state = seamless.from({
        1: {
          _id: '1',
          name: 'one',
        },
      });
      const payload = {
        _id: '2',
        name: 'two',
      };
      const expected = { ...state, 2: payload };

      methods.forEach((method) => {
        const actual = plants(state, actionFunc[method](payload));
        expect(actual).toEqual(expected);
      });
    });

    test('should reduce with existing with replace in place', () => {
      const state = seamless.from({
        1: {
          _id: '1',
          name: 'one',
        },
        2: {
          _id: '2',
          name: 'xxx',
        },
      });
      const payload = {
        _id: '2',
        name: 'two',
      };
      const expected = { ...state, 2: payload };

      methods.forEach((method) => {
        const actual = plants(state, actionFunc[method](payload));
        expect(actual).toEqual(expected);
      });
    });
  });

  test('should delete a plant', () => {
    const expected = {
      1: {
        _id: '1',
        name: 'one',
      },
      2: {
        _id: '2',
        name: 'xxx',
      },
    };
    const current = seamless.from(expected);
    const payload = { locationId: 'l1', plantId: '2' };
    delete expected['2'];

    const actual = plants(current, actionFunc.deletePlantRequest(payload));
    expect(actual).toEqual(expected);
  });

  test('should delete a note', () => {
    const expected = {
      1: {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      2: {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
      3: {
        _id: '3',
        name: 'no note match',
        notes: ['n1', 'n3'],
      },
      4: {
        _id: '4',
        name: 'missing notes',
      },
    };
    const payload = 'n2';
    const current = seamless.from(expected);
    expected['1'].notes.splice(1, 1);
    expected['2'].notes.splice(1, 1);

    const actual = plants(current, actionFunc.deleteNoteRequest(payload));
    expect(actual).toEqual(expected);
  });

  test('should load a plant', () => {
    const expected: Dictionary<object> = {
      1: {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      2: {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
    };
    const payload = {
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2'],
    };
    const current = seamless.from(expected);
    Object.assign(expected, { 3: _.cloneDeep(payload) });
    // @ts-ignore
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actionFunc.loadPlantSuccess(payload));

    expect(actual).toEqual(expected);
  });

  test('should load multiple plants', () => {
    const expected: Dictionary<object> = {
      1: {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      2: {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
    };
    const payload = [{
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2'],
    }];
    const current = seamless.from(expected);
    Object.assign(expected, { 3: _.cloneDeep(payload[0]) });
    // @ts-ignore
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actionFunc.loadPlantsSuccess(payload));
    expect(actual).toEqual(expected);
  });

  test('should load multiple plants with missing payload', () => {
    const expected = {
      1: {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      2: {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
    };
    const payload: any = [];
    const current = seamless.from(expected);

    const actual = plants(current, actionFunc.loadPlantsSuccess(payload));
    expect(actual).toEqual(expected);
    expect(actual).toBe(current);
  });

  test('should add a new noteId to the plant\'s notes List', () => {
    const expected = {
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2'],
      },
    };
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p1', 'p2'],
      },
    };
    const current = seamless.from(expected);
    expected.p1.notes = ['n1', 'n2', 'n3', 'n5'];
    expected.p2.notes = ['n1', 'n2', 'n5'];

    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toEqual(expected);
  });

  test('should remove a removed noteId from the plant\'s notes List', () => {
    const expected = {
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3', 'n5'],
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2'],
      },
      p3: {
        _id: 'p3',
        name: 'three',
      },
    };
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p2'],
      },
    };
    const current = seamless.from(expected);
    expected.p1.notes = ['n1', 'n2', 'n3'];
    expected.p2.notes = ['n1', 'n2', 'n5'];

    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toEqual(expected);
  });

  test('should remove nothing if the payload note is empty', () => {
    const expected = {
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3', 'n5'],
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2'],
      },
    };
    const payload = {
      note: { },
    };
    const current = seamless.from(expected);

    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toBe(current);
  });

  test('should return original state if nothing to update', () => {
    const expected = {
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3', 'n5'],
      },
    };
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p1'],
      },
    };
    const current = seamless.from(expected);

    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toBe(current);
  });

  describe('loadNotesRequest', () => {
    test('should return original state if noteIds present in payload', () => {
      const expected = {};
      const payload = {
        noteIds: true,
      };
      const current = seamless.from(expected);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if plantIds not present in payload', () => {
      const expected = {};
      const payload = {
      };
      const current = seamless.from(expected);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if plant not found in state', () => {
      const expected = {};
      const payload = {
        plantIds: ['not in state'],
      };
      const current = seamless.from(expected);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should flag that notes have been requested for a plant', () => {
      const expected: Dictionary<object> = {
        1: { },
      };
      const payload = {
        plantIds: ['1'],
      };
      const current = seamless.from(expected);
      // @ts-ignore
      expected['1'].notesRequested = true;

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).not.toBe(current);
      expect(actual).toEqual(expected);
    });
  });

  describe('loadNotesSuccess', () => {
    test('should return original state if notes is empty', () => {
      const expected = {};
      const payload: any = [];
      const current = seamless.from(expected);

      const actual = plants(current, actionFunc.loadNotesSuccess(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if notes is an empty object', () => {
      const expected = {};
      const payload = [{}];
      const current = seamless.from(expected);

      const actual = plants(current, actionFunc.loadNotesSuccess(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if notes do not have plantIds', () => {
      const expected: Dictionary<object> = {
        'p-1': {
          notes: ['n-7', 'n-8'],
        },
        'p-2': {
          notes: ['n-2', 'n-3'],
        },
        'p-3': {},
        'p-4': {
          notes: ['n-2', 'n-3'],
        },
      };
      const payload = [{
        _id: 'n-1',
        plantIds: ['p-1', 'p-2'],
      }, {
        _id: 'n-2',
        plantIds: ['p-2', 'p-3'],
      }];
      const current = seamless.from(expected);
      // @ts-ignore
      expected['p-1'].notes.push('n-1');
      // @ts-ignore
      expected['p-2'].notes.push('n-1');
      // @ts-ignore
      expected['p-3'].notes = ['n-2'];

      const actual = plants(current, actionFunc.loadNotesSuccess(payload));

      expect(actual).not.toBe(current);
      expect(actual).toEqual(expected);
    });
  });
});
