// Responsible for showing a single Plant for CRUD operations (this.mode)
// i.e. Create (C), Read (R), Update (U), or Delete (D)
// Url: /plant/slug/<plant-id>
// Unless Create then Url: /plant

const { canEdit } = require('../../libs/auth-helper');
const { makeMongoId } = require('../../libs/utils');
const actions = require('../../actions');
const Base = require('../base/Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const PlantEdit = require('./PlantEdit');
const PlantRead = require('./PlantRead');
const NoteCreate = require('../note/NoteCreate');
const React = require('react');
const Immutable = require('immutable');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

class Plant extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);
    this.initState(true);
  }

  /*
- Start of cycle #2
- invoked when component is receiving new props
- not called in cycle #1
- this.props is old props
- parameter to this function is nextProps
- can call this.setState() here (will not trigger additional render)
*/
  componentWillReceiveProps(nextProps) {
    this.initState(true, nextProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    this.forceUpdate();
    // this.initState(false);
  }

  initState(first, props = this.props || {}) {
    const { store } = this.context;
    const plants = store.getState().get('plants');

    const { match = {}, params = {} } = props;
    const _id = params.id || (match.params && match.params.id);
    let plant;
    if (_id) {
      plant = plants.get(_id);
      if (!plant && first) {
        store.dispatch(actions.loadPlantRequest({ _id }));
      }
    } else {
      const user = store.getState().get('user');
      const locationIds = user.get('locationIds', Immutable.List()).toJS() || [];
      const activeLocationId = user.get('activeLocationId', '');

      // activeLocationId is the one that you last viewed which might not be
      // one that you own/manage. Only set locationId to this if it's one that
      // is in the locationIds list.
      const locationIdsOnly = locationIds.map(locationId => locationId._id);
      const locationId =
        (locationIdsOnly.some(locId => locId === activeLocationId) && activeLocationId)
        || locationIdsOnly[0];

      store.dispatch(actions.editPlantOpen({
        plant: {
          _id: makeMongoId(),
          isNew: true,
          locationId,
        },
      }));
    }
  }

  fromStore(key) {
    const { store } = this.context;
    if (store.getState().has(key)) {
      return store.getState().get(key).toJS();
    }
    return null;
  }

  render() {
    const { store } = this.context;
    const { match = {}, params = {} } = this.props;
    const user = store.getState().get('user');
    const locations = store.getState().get('locations', Immutable.Map());
    const plants = store.getState().get('plants');

    const interim = store.getState().get('interim');
    const interimNote = interim.getIn(['note', 'note'], Immutable.Map());
    const interimPlant = interim.getIn(['plant', 'plant']);

    if (interimPlant) {
      return (<PlantEdit
        dispatch={store.dispatch}
        interimPlant={interimPlant}
        user={user}
      />);
    }

    const plantId = params.id || (match.params && match.params.id);
    if (!plantId) {
      // eslint-disable-next-line no-console
      console.error('Plant.render: plantId is falsy', this.props);
    }

    const plant = plants.get(plantId);

    if (!plant) {
      return (
        <Base>
          <CircularProgress />
        </Base>
      );
    }

    const locationId = (interimPlant || plant).get('locationId');
    const location = locations.get(locationId);
    const loggedInUserId = store.getState().getIn(['user', '_id']);
    const userCanEdit = canEdit(loggedInUserId, location);

    const notes = store.getState().get('notes');

    return (
      <Base>
        <div>
          <div>
            <PlantRead
              dispatch={store.dispatch}
              interim={interim}
              userCanEdit={userCanEdit}
              locations={locations}
              notes={notes}
              plant={plant}
              plants={plants}
            />
            {plant && plant.get('title') &&
            <NoteCreate
              dispatch={store.dispatch}
              interimNote={interimNote}
              userCanEdit={userCanEdit}
              plant={plant}
              plants={plants}
              locationId={locationId}
            />
          }
          </div>
        </div>
      </Base>
    );
  }
}

Plant.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  params: PropTypes.shape({
    id: PropTypes.string,
  }),
};

Plant.defaultProps = {
  match: {
    params: {},
  },
  params: {},
};

module.exports = withRouter(Plant);
