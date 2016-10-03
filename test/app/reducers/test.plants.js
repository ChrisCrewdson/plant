const _ = require('lodash');
const plants = require('../../../app/reducers/plants');
const actions = require('../../../app/actions');
const assert = require('assert');
const Immutable = require('immutable');

describe('/app/reducers/plants', function() {
  describe('similar methods', () => {
    const methods = [
      'createPlantRequest',
      'createPlantFailure',
      'deletePlantFailure',
      'updatePlantFailure',
      'updatePlantRequest',
      'loadPlantFailure'
    ];

    it('should reduce using replace in place', () => {
      const state = Immutable.fromJS({
        '1': {
          _id: '1',
          name: 'one'
        }
      });
      const payload = {
        _id: '2',
        name: 'two'
      };
      const expected = Object.assign({}, state.toJS(), {'2': payload});

      methods.forEach(method => {
        const actual = plants(state, actions[method](payload));
        assert.deepEqual(actual.toJS(), expected);
      });

    });

    it('should reduce with existing with replace in place', () => {
      const state = Immutable.fromJS({
        '1': {
          _id: '1',
          name: 'one'
        },
        '2': {
          _id: '2',
          name: 'xxx'
        }
      });
      const payload = {
        _id: '2',
        name: 'two'
      };
      const expected = Object.assign({}, state.toJS(), {'2': payload});

      methods.forEach(method => {
        const actual = plants(state, actions[method](payload));
        assert.deepEqual(actual.toJS(), expected);
      });

    });
  });

  it('should delete a plant', () => {
    const current = Immutable.fromJS({
      '1': {
        _id: '1',
        name: 'one'
      },
      '2': {
        _id: '2',
        name: 'xxx'
      }
    });
    const payload = '2';
    const expected = current.toJS();
    delete expected['2'];

    const actual = plants(current, actions.deletePlantRequest(payload));
    assert.deepEqual(actual.toJS(), expected);

  });

  it('should delete a note', () => {
    const current = Immutable.fromJS({
      '1': {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3']
      },
      '2': {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3']
      }
    });
    const payload = 'n2';
    const expected = current.toJS();
    expected['1'].notes.splice(1, 1);
    expected['2'].notes.splice(1, 1);

    const actual = plants(current, actions.deleteNoteRequest(payload));
    assert.deepEqual(actual.toJS(), expected);
  });

  it('should load a plant', () => {
    const current = Immutable.fromJS({
      '1': {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3']
      },
      '2': {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3']
      }
    });
    const payload = {
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2']
    };
    const expected = Object.assign({}, current.toJS(), {'3': _.cloneDeep(payload)});
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actions.loadPlantSuccess(payload));

    assert.deepEqual(actual.toJS(), expected);
  });

  it('should load multiple plants', () => {
    const current = Immutable.fromJS({
      '1': {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3']
      },
      '2': {
        _id: '2',
        name: 'xxx',
        notes: ['n1', 'n2', 'n3']
      }
    });
    const payload = [{
      _id: '3',
      name: 'three',
      notes: ['n1', 'n2']
    }];
    const expected = Object.assign({}, current.toJS(), {'3': _.cloneDeep(payload[0])});
    expected['3'].notes = ['n1', 'n2'];

    const actual = plants(current, actions.loadPlantsSuccess(payload));
    assert.deepEqual(actual.toJS(), expected);
  });

  it('should set the plant mode', () => {
    const current = Immutable.fromJS({
      '1': {
        _id: '1',
        name: 'one',
        notes: ['n1', 'n2', 'n3']
      }
    });
    const payload = {
      _id: '1',
      mode: 'update'
    };
    const expected = current.toJS();
    expected['1'].mode = 'update';

    const actual = plants(current, actions.setPlantMode(payload));
    assert.deepEqual(actual.toJS(), expected);
  });

  it('should handle a create a note success', () => {
    const current = Immutable.fromJS({
      'p1': {
        _id: 'p1',
        name: 'one',
        notes: ['n1', 'n2', 'n3']
      },
      'p2': {
        _id: 'p2',
        name: 'xxx',
        notes: ['n1', 'n2']
      }
    });
    const payload = {
      note: {
        _id: 'n5',
        plantIds: ['p1', 'p2']
      }
    };
    const expected = current.toJS();
    expected.p1.notes = ['n1', 'n2', 'n3', 'n5'];
    expected.p2.notes = ['n1', 'n2', 'n5'];

    const actual = plants(current, actions.upsertNoteSuccess(payload));
    assert.deepEqual(actual.toJS(), expected);
  });

});
