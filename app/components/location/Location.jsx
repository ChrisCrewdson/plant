// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

const Base = require('../base/Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const InputCombo = require('../common/InputCombo');
const PlantItem = require('../plant/PlantItem');
const React = require('react');
const { canEdit } = require('../../libs/auth-helper');
const actions = require('../../actions');
const NoteCreate = require('../note/NoteCreate');
const utils = require('../../libs/utils');
const Immutable = require('immutable');
const AddPlantButton = require('../common/AddPlantButton');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

class Location extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  static renderNoPlants(location, userCanEdit) {
    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <div style={{ marginTop: '100px' }}>No plants added yet...</div>
            <AddPlantButton
              show={userCanEdit}
              style={{ marginTop: '10px' }}
            />
          </h3>
        </div>
      </Base>
    );
  }

  static renderWaiting(location) {
    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <CircularProgress />
          </h3>
        </div>
      </Base>
    );
  }

  static renderTitle(location) {
    return (
      <h2 style={{ textAlign: 'center' }}>{`${location.get('title')} - Plant List`}</h2>
    );
  }

  static addPlantButton(userCanEdit) {
    return (
      <div style={{ float: 'right', marginBottom: '60px' }}>
        <AddPlantButton
          show={userCanEdit}
        />
      </div>
    );
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    this.state = { filter: '' };
  }

  componentWillMount() {
    const { store } = this.context;
    const locations = store.getState().get('locations', Immutable.Map());

    const { id: locationId } = this.props.match.params;

    const plantIds = locations.getIn([locationId, 'plantIds']);
    if (!plantIds) {
      store.dispatch(actions.loadPlantsRequest(locationId));
    }
    this.onChange();
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const { store } = this.context;
    const locations = store.getState().get('locations');
    const allLoadedPlants = store.getState().get('plants');
    const interim = store.getState().get('interim');
    const authUser = store.getState().get('user');
    const users = store.getState().get('users');
    const state = {
      locations, allLoadedPlants, interim, authUser, users,
    };
    this.setState(state);
  }

  postSaveSuccessCreateNote() {
    const { store } = this.context;
    store.dispatch(actions.editNoteClose());
  }

  render() {
    const { store } = this.context;
    const {
      filter = '',
      locations,
      allLoadedPlants,
      interim,
      authUser,
    } = this.state || {};

    const location = locations && locations.get(this.props.match.params.id);
    if (!location) {
      return (
        <Base>
          <div>
            <CircularProgress />
          </div>
        </Base>
      );
    }

    const interimNote = interim.getIn(['note', 'note']);
    const plantCreateNote = interim.getIn(['note', 'plant']);
    const createNote = !!interimNote && interimNote.get('isNew');

    const userCanEdit = canEdit(authUser.get('_id'), location);

    if (createNote && userCanEdit) {
      const style = {
        paddingTop: '30px',
        textAlign: 'center',
      };
      return (
        <Base>
          <div>
            <h4 style={style}>{`Create a Note for ${plantCreateNote.get('title')}`}</h4>
            <NoteCreate
              dispatch={store.dispatch}
              userCanEdit={userCanEdit}
              interimNote={interimNote}
              plant={plantCreateNote}
              plants={allLoadedPlants}
              postSaveSuccess={this.postSaveSuccessCreateNote}
              user={authUser}
            />
          </div>
        </Base>
      );
    }

    const plantIds = location.get('plantIds', Immutable.List());
    if (!plantIds.size) {
      if (interim.has('loadPlantRequest')) {
        return Location.renderWaiting(location);
      }
      return this.renderNoPlants(location, userCanEdit);
    }

    const sortedPlantIds = utils.filterSortPlants(plantIds, allLoadedPlants, filter);
    const plantStats = utils.plantStats(plantIds, allLoadedPlants);

    // Don't send the name into PlantItem to skip the subtitle
    // If all the plants are at the same location then don't need the
    // location name. If the plants are from a search result then send
    // in the name:
    // title={location.title}
    const tileElements = sortedPlantIds.reduce((acc, plantId) => {
      const plant = allLoadedPlants.get(plantId);
      if (plant) {
        const _id = plant.get('_id');
        acc.found.push(<PlantItem
          key={_id}
          dispatch={store.dispatch}
          createNote={this.createNote}
          userCanEdit={userCanEdit}
          plant={plant}
        />);
      } else {
        acc.unloaded.push(plantId);
      }
      return acc;
    }, { found: [], unloaded: [] });

    if (tileElements.unloaded.length) {
      store.dispatch(actions.loadUnloadedPlantsRequest(tileElements.unloaded));
    }

    const filterInput = (<InputCombo
      changeHandler={e => this.setState({ filter: e.target.value.toLowerCase() })}
      label="Filter"
      placeholder="Type a plant name to filter..."
      value={filter}
      name="filter"
    />);

    const stats = (
      <div>
        <p>{`Total: ${plantStats.total}`}</p>
        <p>{`Alive: ${plantStats.alive}`}</p>
      </div>);

    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          {stats}
          {filterInput}
          {tileElements.found}
          {Location.addPlantButton(userCanEdit)}
          <div className="clear">&nbsp;</div>
        </div>
      </Base>
    );
  }
}

Location.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

module.exports = withRouter(Location);
