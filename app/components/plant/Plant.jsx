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
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const getIn = require('lodash/get');

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
    const { plants, user, users = {} } = store.getState();

    const { match = {}, params = {} } = props;
    const _id = params.id || (match.params && match.params.id);
    let plant;
    if (_id) {
      plant = plants[_id];
      if (!plant && first) {
        store.dispatch(actions.loadPlantRequest({ _id }));
      }
    } else {
      const { _id: userId = '', activeLocationId } = user;
      const { locationIds = [] } = users[userId];

      // activeLocationId is the one that you last viewed which might not be
      // one that you own/manage. Only set locationId to this if it's one that
      // is in the locationIds list.
      const locationId =
        (locationIds.some(locId => locId === activeLocationId) && activeLocationId)
        || locationIds[0];

      store.dispatch(actions.editPlantOpen({
        plant: {
          _id: makeMongoId(),
          isNew: true,
          locationId,
        },
      }));
    }
  }

  render() {
    const { store } = this.context;
    const { match = {}, params = {} } = this.props;
    const {
      interim,
      locations = {},
      notes,
      plants,
      user,
      users,
    } = store.getState();

    const interimNote = getIn(interim, ['note', 'note'], {});
    const interimPlant = getIn(interim, ['plant', 'plant']);

    if (interimPlant) {
      return (<PlantEdit
        dispatch={store.dispatch}
        interimPlant={interimPlant}
        locations={locations}
        user={user}
        users={users}
      />);
    }

    const plantId = params.id || (match.params && match.params.id);
    if (!plantId) {
      // eslint-disable-next-line no-console
      console.error('Plant.render: plantId is falsy', this.props);
    }

    const plant = plants[plantId];

    if (!plant) {
      return (
        <Base>
          <CircularProgress />
        </Base>
      );
    }

    const { locationId } = (interimPlant || plant);
    const location = locations[locationId];
    const loggedInUserId = user && user._id;
    const userCanEdit = canEdit(loggedInUserId, location);

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
            {plant && plant.title &&
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
