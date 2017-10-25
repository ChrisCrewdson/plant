const _ = require('lodash');
const plants = require('../../../app/reducers/plants');
const actions = require('../../../app/actions');
const Immutable = require('immutable');

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
      const state = Immutable.fromJS({
        1: {
          _id: '1',
          name: 'one',
        },
      });
      const payload = {
        _id: '2',
        name: 'two',
      };
      const expected = Object.assign({}, state.toJS(), { 2: payload });

      methods.forEach((method) => {
        const actual = plants(state, actions[method](payload));
        expect(actual.toJS()).toEqual(expected);
      });
    });

    test('should reduce with existing with replace in place', () => {
      const state = Immutable.fromJS({
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
      const expected = Object.assign({}, state.toJS(), { 2: payload });

      methods.forEach((method) => {
        const actual = plants(state, actions[method](payload));
        expect(actual.toJS()).toEqual(expected);
      });
    });
  });

  test('should delete a plant', () => {
    const current = Immutable.fromJS({
      1: {
        _id: '1',
        name: 'one',
      },
      2: {
        _id: '2',
        name: 'xxx',
      },
    });
    const payload = { locationId: 'l1', plantId: '2' };
    const expected = current.toJS();
    delete expected['2'];

    const actual = plants(current, actions.deletePlantRequest(payload));
    expect(actual.toJS()).toEqual(expected);
  });

  test('should delete a note', () => {
    const current = Immutable.fromJS({
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
    });
    const payload = 'n2';
    const expected = current.toJS();
    expected['1'].notes.splice(1, 1);
    expected['2'].notes.splice(1, 1);

    const actual = plants(current, actions.deleteNoteRequest(payload));
    expect(actual.toJS()).toEqual(expected);
  });

  test('should load a plant', () => {
    const current = Immutable.fromJS({
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
    });
    const payload = {
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2'],
    };
    const expected = Object.assign({}, current.toJS(), { 3: _.cloneDeep(payload) });
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actions.loadPlantSuccess(payload));

    expect(actual.toJS()).toEqual(expected);
  });

  test('should load multiple plants', () => {
    const current = Immutable.fromJS({
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
    });
    const payload = [{
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2'],
    }];
    const expected = Object.assign({}, current.toJS(), { 3: _.cloneDeep(payload[0]) });
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actions.loadPlantsSuccess(payload));
    expect(actual.toJS()).toEqual(expected);
  });

  test('should add a new noteId to the plant\'s notes List', () => {
    const current = Immutable.fromJS({
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
    });
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p1', 'p2'],
      },
    };
    const expected = current.toJS();
    expected.p1.notes = ['n1', 'n2', 'n3', 'n5'];
    expected.p2.notes = ['n1', 'n2', 'n5'];

    const actual = plants(current, actions.upsertNoteSuccess(payload));
    expect(actual.toJS()).toEqual(expected);
  });

  test('should remove a removed noteId to the plant\'s notes List', () => {
    const current = Immutable.fromJS({
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
    });
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p2'],
      },
    };
    const expected = current.toJS();
    expected.p1.notes = ['n1', 'n2', 'n3'];
    expected.p2.notes = ['n1', 'n2', 'n5'];

    const actual = plants(current, actions.upsertNoteSuccess(payload));
    expect(actual.toJS()).toEqual(expected);
  });
});
