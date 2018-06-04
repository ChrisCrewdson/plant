// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

const Base = require('../base/Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const InputComboText = require('../common/InputComboText');
const PlantItem = require('../plant/PlantItem');
const React = require('react');
const { canEdit } = require('../../libs/auth-helper');
const actions = require('../../actions');
const NoteCreate = require('../note/NoteCreate');
const utils = require('../../libs/utils');
const AddPlantButton = require('../common/AddPlantButton');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');

class Location extends React.Component {
  static addPlantButton(userCanEdit) {
    return (
      <div style={{ float: 'right', marginBottom: '60px' }}>
        <AddPlantButton
          show={userCanEdit}
        />
      </div>
    );
  }

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    this.state = { filter: '' };
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context;
    const { locations = {} } = store.getState();

    const { id: locationId } = this.props.match.params;

    const plantIds = locations[locationId] && locations[locationId].plantIds;
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
    const {
      interim,
      locations,
      plants: allLoadedPlants,
      user: authUser,
      users,
    } = store.getState();
    const state = {
      allLoadedPlants,
      authUser,
      interim,
      locations,
      users,
    };
    this.setState(state);
  }

  postSaveSuccessCreateNote() {
    const { store } = this.context;
    store.dispatch(actions.editNoteClose());
  }

  static renderTitle(location) {
    return (
      <h2 style={{ textAlign: 'center' }}>{`${location.title} - Plant List`}</h2>
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

  render() {
    const { store } = this.context;
    const {
      filter = '',
      locations,
      allLoadedPlants,
      interim,
      authUser,
    } = this.state || {};

    const location = locations && locations[this.props.match.params.id];
    if (!location) {
      return (
        <Base>
          <div>
            <CircularProgress />
          </div>
        </Base>
      );
    }

    const {
      note: interimNote,
      plant: plantCreateNote,
    } = interim.note || {};
    const createNote = !!interimNote && interimNote.isNew;

    const userCanEdit = canEdit(authUser._id, location);
    const { _id: locationId } = location;

    if (createNote && userCanEdit) {
      const style = {
        paddingTop: '30px',
        textAlign: 'center',
      };
      return (
        <Base>
          <div>
            <h4 style={style}>{`Create a Note for ${plantCreateNote.title}`}</h4>
            <NoteCreate
              dispatch={store.dispatch}
              userCanEdit={userCanEdit}
              interimNote={interimNote}
              plant={plantCreateNote}
              plants={allLoadedPlants}
              postSaveSuccess={this.postSaveSuccessCreateNote}
              locationId={locationId}
            />
          </div>
        </Base>
      );
    }

    const { plantIds = [] } = location;
    if (!plantIds.length) {
      if (interim.loadPlantRequest) {
        return Location.renderWaiting(location);
      }
      return Location.renderNoPlants(location, userCanEdit);
    }

    const sortedPlantIds = utils.filterSortPlants(plantIds, allLoadedPlants, filter);
    const plantStats = utils.plantStats(plantIds, allLoadedPlants);

    // Don't send the name into PlantItem to skip the subtitle
    // If all the plants are at the same location then don't need the
    // location name. If the plants are from a search result then send
    // in the name:
    // title={location.title}
    const tileElements = sortedPlantIds.reduce((acc, plantId) => {
      const plant = allLoadedPlants[plantId];
      if (plant) {
        const { _id } = plant;
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

    const filterInput = (<InputComboText
      changeHandler={e => this.setState({ filter: e.target.value.toLowerCase() })}
      id="plant-title-filter"
      label="Filter"
      name="filter"
      placeholder="Type a plant name to filter..."
      value={filter}
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
