// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

const Base = require('../Base');
const CircularProgress = require('material-ui/CircularProgress').default;
const InputCombo = require('../InputCombo');
const PlantItem = require('../plants/PlantItem');
const React = require('react');
const {isLoggedIn} = require('../../libs/auth-helper');
const actions = require('../../actions');
const NoteCreate = require('../plant/NoteCreate');
const utils = require('../../libs/utils');
const Immutable = require('immutable');
const AddPlantButton = require('../plant/AddPlantButton');
const PropTypes = require('prop-types');

class Location extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    this.state = {filter: ''};
  }

  componentWillMount() {
    const {store} = this.context;
    const locations = store.getState().get('locations', Immutable.Map());

    const {id: locationId} = this.props.params;

    const plantIds = locations.getIn([locationId, 'plantIds']);
    if(!plantIds) {
      store.dispatch(actions.loadPlantsRequest(locationId));
    }
    this.onChange();
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const {store} = this.context;
    const locations = store.getState().get('locations');
    const allLoadedPlants = store.getState().get('plants');
    const interim = store.getState().get('interim');
    const authUser = store.getState().get('user');
    const users = store.getState().get('users');
    const state = {locations, allLoadedPlants, interim, authUser, users};
    this.setState(state);
  }

  postSaveSuccessCreateNote() {
    const {store} = this.context;
    store.dispatch(actions.editNoteClose());
  }

  renderTitle(location) {
    return (
      <h2 style={{textAlign: 'center'}}>{`${location.get('title')} - Plant List`}</h2>
    );
  }

  isOwner() {
    // TODO: Check the logic below
    var {
      authUser = Immutable.Map(),
      users = Immutable.Map(),
    } = this.state || {};
    const user = users.get(this.props.params.id);
    return !!(user && authUser.get('_id') === user.get('_id'));
  }

  addPlantButton() {
    return (
      <div style={{float: 'right', marginBottom: '60px'}}>
        <AddPlantButton
          show={this.isOwner()}
        />
      </div>
    );
  }

  // TODO: renderWaiting and renderNoPlants are mostly the same.
  // Make this code DRY
  renderWaiting(location) {
    return (
      <Base>
        <div>
          {this.renderTitle(location)}
          <h3 style={{textAlign: 'center'}}>
            <CircularProgress />
          </h3>
        </div>
      </Base>
    );
  }

  renderNoPlants(location) {
    return (
      <Base>
        <div>
          {this.renderTitle(location)}
          <h3 style={{textAlign: 'center'}}>
            <div style={{marginTop: '100px'}}>{'No plants added yet...'}</div>
            <AddPlantButton
              show={this.isOwner()}
              style={{marginTop: '10px'}}
            />
          </h3>
        </div>
      </Base>
    );
  }

  render() {
    const {store} = this.context;
    const {
      filter = '',
      locations,
      allLoadedPlants,
      interim,
      authUser,
    } = this.state || {};

    const loggedIn = !!isLoggedIn(store);

    const location = locations && locations.get(this.props.params.id);
    if(!location) {
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

    if(createNote && loggedIn) {
      const style = {
        paddingTop: '30px',
        textAlign: 'center'
      };
      return (
        <Base>
          <div>
            <h4 style={style}>{`Create a Note for ${plantCreateNote.get('title')}`}</h4>
            <NoteCreate
              dispatch={store.dispatch}
              isOwner={true}
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
    if(!plantIds.size) {
      if(interim.has('loadPlantRequest')) {
        return this.renderWaiting(location);
      } else {
        return this.renderNoPlants(location);
      }
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
      if(plant) {
        const _id = plant.get('_id');
        const isOwner = loggedIn && plant.get('userId') === authUser.get('_id');
        acc.found.push(
          <PlantItem
            key={_id}
            dispatch={store.dispatch}
            createNote={this.createNote}
            isOwner={isOwner}
            plant={plant}
          />
        );
      } else {
        acc.unloaded.push(plantId);
      }
      return acc;
    }, {found: [], unloaded: []});

    if(tileElements.unloaded.length) {
      store.dispatch(actions.loadUnloadedPlantsRequest(tileElements.unloaded));
    }

    const filterInput = (<InputCombo
      changeHandler={(e) => this.setState({filter: e.target.value.toLowerCase()})}
      label='Filter'
      placeholder={'Type a plant name to filter...'}
      value={filter}
      name='filter'
    />);

    const stats = (<div>
      <p>{`Total: ${plantStats.total}`}</p>
      <p>{`Alive: ${plantStats.alive}`}</p>
    </div>);

    return (
      <Base>
        <div>
          {this.renderTitle(location)}
          {stats}
          {filterInput}
          {tileElements.found}
          {this.addPlantButton()}
          <div className='clear'>&nbsp;</div>
        </div>
      </Base>
    );
  }
}

Location.propTypes = {
  params:  PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

module.exports = Location;
