import { produce } from 'immer';
import _ from 'lodash';

import { plants } from '../../../app/reducers/plants';
import { actionFunc } from '../../../app/actions';
import { UpsertNoteRequestPayload } from '../../../lib/types/redux-payloads';

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
      const state = produce({
        1: {
          _id: '1',
          name: 'one',
        },
      }, (draft) => draft) as unknown as UiPlants;
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
      const state = produce({
        1: {
          _id: '1',
          name: 'one',
        },
        2: {
          _id: '2',
          name: 'xxx',
        },
      }, (draft) => draft) as unknown as UiPlants;
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
    const current = produce({
      p1: {
        _id: 'p1',
        name: 'one',
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
      },
    }, (draft) => draft) as unknown as UiPlants;
    const expected = produce(current, (draft) => {
      delete draft.p2;
    });
    const payload = { locationId: 'l1', plantId: 'p2' };

    const actual = plants(current, actionFunc.deletePlantRequest(payload));
    expect(actual).toEqual(expected);
  });

  test('should delete a note', () => {
    const current = produce({
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
      p3: {
        _id: 'p3',
        name: 'no note match',
        notes: ['n1', 'n3'],
      },
      p4: {
        _id: 'p4',
        name: 'missing notes',
      },
    }, (draft) => draft) as unknown as UiPlants;
    const payload = 'n2';
    const expected = produce(current, (draft) => {
      if (draft.p1.notes) {
        draft.p1.notes.splice(1, 1);
      }
      if (draft.p2.notes) {
        draft.p2.notes.splice(1, 1);
      }
    });

    const actual = plants(current, actionFunc.deleteNoteRequest(payload));
    expect(actual).toEqual(expected);
  });

  test('should load a plant', () => {
    const current = produce({
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
    }, (draft) => draft) as unknown as UiPlants;

    const payload: Readonly<BizPlant> = {
      _id: '3',
      title: 'three',
      notes: ['n1', 'n2'],
      locationId: 'l-1',
      userId: 'u-1',
    };

    const expected = produce(current, (draft) => {
      Object.assign(draft, { 3: _.cloneDeep(payload) });
      draft['3'].notes = ['n1', 'n2'];
    });

    const actual = plants(current, actionFunc.loadPlantSuccess(payload));

    expect(actual).toEqual(expected);
  });

  test('should load multiple plants', () => {
    const current = produce({
      p1: {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3'],
      },
      p2: {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3'],
      },
    }, (draft) => draft) as unknown as UiPlants;

    const p3: Readonly<BizPlant> = {
      _id: 'p3',
      title: 'three',
      notes: ['n1', 'n2'],
    } as any;

    const expected = produce(current, (draft) => {
      Object.assign(draft, { p3: _.cloneDeep(p3) });
      draft.p3.notes = ['n1', 'n2'];
    });

    const payload: ReadonlyArray<BizPlant> = [p3];

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
    } as unknown as UiPlants;
    const payload: ReadonlyArray<BizPlant> = [];
    const current = produce(expected, (draft) => draft);

    const actual = plants(current, actionFunc.loadPlantsSuccess(payload));
    expect(actual).toEqual(expected);
    expect(actual).toBe(current);
  });

  test('should add a new noteId to the plant\'s notes List', () => {
    const current = produce({
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
    }, (draft) => draft) as unknown as UiPlants;

    const payload: UpsertNoteRequestPayload = {
      note: {
        _id: 'n5',
        plantIds: ['p1', 'p2'],
      },
    };

    const expected = produce(current, (draft) => {
      draft.p1.notes = ['n1', 'n2', 'n3', 'n5'];
      draft.p2.notes = ['n1', 'n2', 'n5'];
    });
    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toEqual(expected);
  });

  test('should remove a removed noteId from the plant\'s notes List', () => {
    const current = produce({
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
    }, (draft) => draft) as unknown as UiPlants;

    const payload: UpsertNoteRequestPayload = {
      note: {
        _id: 'n5',
        plantIds: ['p2'],
      },
    };

    const expected = produce(current, (draft) => {
      draft.p1.notes = ['n1', 'n2', 'n3'];
      draft.p2.notes = ['n1', 'n2', 'n5'];
    });

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
    } as unknown as UiPlants;
    const payload: UpsertNoteRequestPayload = {
      note: { },
    } as any;
    const current = produce(expected, (draft) => draft);

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
    } as unknown as UiPlants;
    const payload: UpsertNoteRequestPayload = {
      note: {
        _id: 'n5',
        plantIds: ['p1'],
      },
    };
    const current = produce(expected, (draft) => draft);

    const actual = plants(current, actionFunc.upsertNoteSuccess(payload));
    expect(actual).toBe(current);
  });

  describe('loadNotesRequest', () => {
    test('should return original state if noteIds present in payload', () => {
      const expected = {};
      const payload = {
        noteIds: true,
      };
      const current = produce(expected, (draft) => draft);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if plantIds not present in payload', () => {
      const expected = {};
      const payload = {
      };
      const current = produce(expected, (draft) => draft);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if plant not found in state', () => {
      const expected = {};
      const payload = {
        plantIds: ['not in state'],
      };
      const current = produce(expected, (draft) => draft);

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).toBe(current);
    });

    test('should flag that notes have been requested for a plant', () => {
      const current = produce({
        1: { },
      }, (draft) => draft) as unknown as UiPlants;

      const payload = {
        plantIds: ['1'],
      };

      const expected = produce(current, (draft) => {
        draft['1'].notesRequested = true;
      });

      const actual = plants(current, actionFunc.loadNotesRequest(payload));
      expect(actual).not.toBe(current);
      expect(actual).toEqual(expected);
    });
  });

  describe('loadNotesSuccess', () => {
    test('should return original state if notes is empty', () => {
      const expected = {};
      const payload: any = [];
      const current = produce(expected, (draft) => draft);

      const actual = plants(current, actionFunc.loadNotesSuccess(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if notes is an empty object', () => {
      const expected = {};
      const payload = [{}];
      const current = produce(expected, (draft) => draft);

      const actual = plants(current, actionFunc.loadNotesSuccess(payload));
      expect(actual).toBe(current);
    });

    test('should return original state if notes do not have plantIds', () => {
      const current = produce({
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
      }, (draft) => draft) as unknown as UiPlants;

      const payload = [{
        _id: 'n-1',
        plantIds: ['p-1', 'p-2'],
      }, {
        _id: 'n-2',
        plantIds: ['p-2', 'p-3'],
      }];

      const expected = produce(current, (draft) => {
        if (draft['p-1'].notes) {
          draft['p-1'].notes.push('n-1');
        }
        if (draft['p-2'].notes) {
          draft['p-2'].notes.push('n-1');
        }
        draft['p-3'].notes = ['n-2'];
      });
      const actual = plants(current, actionFunc.loadNotesSuccess(payload));

      expect(actual).not.toBe(current);
      expect(actual).toEqual(expected);
    });
  });
});
