// Used to show a collection of metrics for a location.
// Url: /metrics/<location-name>/_location_id

const Base = require('../../base/Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const PlantItem = require('../../plant/PlantItem');
const React = require('react');
const { canEdit } = require('../../../libs/auth-helper');
const actions = require('../../../actions');
const utils = require('../../../libs/utils');
const AddPlantButton = require('../../common/AddPlantButton');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const LastMeasured = require('./LastMeasured');

// TODO: AT THIS POINT THIS FILE IS JUST A COPY OF THE Location file/class
// with the class renamed to Metrics. It's tested and works on the url.
// With this as an initial commit it is easy to iterate on this.

class Metrics extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  static renderNoPlants(location, userCanEdit) {
    return (
      <Base>
        <div>
          {Metrics.renderTitle(location)}
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
          {Metrics.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <CircularProgress />
          </h3>
        </div>
      </Base>
    );
  }

  static renderTitle(location) {
    return (
      <h2 style={{ textAlign: 'center' }}>{`${location.title} - Metrics`}</h2>
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

    const userCanEdit = canEdit(authUser._id, location);

    const { plantIds = [] } = location;
    if (!plantIds.length) {
      if (interim.loadPlantRequest) {
        return Metrics.renderWaiting(location);
      }
      return Metrics.renderNoPlants(location, userCanEdit);
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

    const stats = (
      <div>
        <p>{`Total: ${plantStats.total}`}</p>
        <p>{`Alive: ${plantStats.alive}`}</p>
      </div>);

    // TODO: metricDate must come from a collection of toggle/checkbox inputs that
    // the user selects to determine what the most recent date is for that metric
    const metricDates = ['height', 'girth'];

    return (
      <Base>
        <div>
          {Metrics.renderTitle(location)}
          {stats}
          <LastMeasured
            plantIds={plantIds}
            plants={allLoadedPlants}
            metricDates={metricDates}
            dispatch={store.dispatch}
          />
          <div className="clear">&nbsp;</div>
        </div>
      </Base>
    );
  }
}

Metrics.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

module.exports = withRouter(Metrics);
