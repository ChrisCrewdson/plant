// Used to show a list of plants for a location.
// Url: /location/<location-name>/_location_id

const CircularProgress = require('material-ui/CircularProgress').default;
const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const Base = require('../base/Base');
const InputComboText = require('../common/InputComboText');
const PlantItem = require('../plant/PlantItem');
const { canEdit } = require('../../libs/auth-helper');
const { actionFunc } = require('../../actions');
const NoteCreate = require('../note/NoteCreate');
const utils = require('../../libs/utils');
const AddPlantButton = require('../common/AddPlantButton');

class Location extends React.Component {
  /**
   *
   * @param {boolean} userCanEdit
   */
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
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  /**
   * @param {LocationProps} props
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.postSaveSuccessCreateNote = this.postSaveSuccessCreateNote.bind(this);
    /** @type {LocationState} */
    // eslint-disable-next-line react/state-in-constructor
    this.state = { filter: '' };
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { locations = {} } = store.getState();
    const { match: { params } } = this.props;
    const { id: locationId } = params;

    const plantIds = locations[locationId] && locations[locationId].plantIds;
    if (!plantIds) {
      store.dispatch(actionFunc.loadPlantsRequest(locationId));
    }
    this.onChange();
    this.unsubscribe = store.subscribe(this.onChange);
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    store.dispatch(actionFunc.editNoteClose());
  }

  /**
   * @static
   * @param {UiLocationsValue} location
   * @returns
   * @memberof Location
   */
  static renderTitle(location) {
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${location.title} - Plant List`}
      </h2>
    );
  }

  /**
   * @static
   * @param {UiLocationsValue} location
   * @returns
   * @memberof Location
   */
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

  /**
   * @static
   * @param {UiLocationsValue} location
   * @param {boolean} userCanEdit
   * @returns
   * @memberof Location
   */
  static renderNoPlants(location, userCanEdit) {
    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          <h3 style={{ textAlign: 'center' }}>
            <div style={{ marginTop: '100px' }}>
No plants added yet...
            </div>
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
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const {
      filter = '',
      locations,
      allLoadedPlants,
      interim,
      authUser,
    } = this.state;
    const { match: { params } } = this.props;

    const location = locations && locations[params.id];
    if (!location) {
      return (
        <Base>
          <div>
            <CircularProgress />
          </div>
        </Base>
      );
    }

    const interimNote = interim && interim.note && interim.note.note;
    const plantCreateNote = interim && interim.note && interim.note.plant;

    const createNote = !!(interimNote && interimNote.isNew);

    const userCanEdit = canEdit(authUser && authUser._id, location);
    const { _id: locationId } = location;

    if (createNote && userCanEdit) {
      /** @type {React.CSSProperties} */
      const style = {
        paddingTop: '30px',
        textAlign: 'center',
      };
      return (
        <Base>
          <div>
            <h4 style={style}>
              {`Create a Note for ${plantCreateNote && plantCreateNote.title}`}
            </h4>
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

    const { plantIds } = location;
    if (!plantIds || !plantIds.length) {
      if (interim && interim.loadPlantRequest) {
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
      const plant = allLoadedPlants && allLoadedPlants[plantId];
      if (plant) {
        const { _id } = plant;
        acc.found.push(<PlantItem
          key={_id}
          dispatch={store.dispatch}
          userCanEdit={userCanEdit}
          plant={plant}
        />);
      } else {
        acc.unloaded.push(plantId);
      }
      return acc;
    }, {
      found: /** @type {JSX.Element[]} */ ([]),
      unloaded: /** @type {string[]} */ ([]),
    });

    if (tileElements.unloaded.length) {
      store.dispatch(actionFunc.loadUnloadedPlantsRequest(tileElements.unloaded));
    }

    const filterInput = (
      <InputComboText
        changeHandler={(e) => this.setState({ filter: e.target.value.toLowerCase() })}
        id="plant-title-filter"
        label="Filter"
        name="filter"
        placeholder="Type a plant name to filter..."
        value={filter}
      />
    );

    const stats = (
      <div>
        <p>
          {`Total: ${plantStats.total}`}
        </p>
        <p>
          {`Alive: ${plantStats.alive}`}
        </p>
      </div>
    );

    return (
      <Base>
        <div>
          {Location.renderTitle(location)}
          {stats}
          {filterInput}
          {tileElements.found}
          {Location.addPlantButton(userCanEdit)}
          <div className="clear">
&nbsp;
          </div>
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

// @ts-ignore - TODO: Solve withRouter() param and tsc
module.exports = withRouter(Location);
