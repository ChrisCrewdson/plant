// Used to show a list of locations.
// Url: /locations
// or the locations for a specific user
// Url: /locations/<user-name>/<_user_id>

const React = require('react');
const { withRouter } = require('react-router-dom');
const PropTypes = require('prop-types');
const Base = require('../base/Base');
const AddLocationButton = require('./AddLocationButton');
const LocationTile = require('./LocationTile');

class Locations extends React.Component {
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  /**
   * Shares the same props shape as Location
   * @param {LocationProps} props
   * @memberof Locations
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.renderLocation = this.renderLocation.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    this.unsubscribe = store.subscribe(this.onChange);

    this.updateState();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange() {
    this.updateState();
  }

  updateState() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { locations, users } = store.getState();
    this.setState({ locations, users });
  }

  /**
   * @param {UiUsersValue|undefined} user
   * @returns
   * @memberof Locations
   */
  isOwner(user) {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { user: authUser } = store.getState();
    return !!(user && authUser && authUser._id === user._id);
  }

  /**
   * @static
   * @param {string|undefined} title
   * @returns
   * @memberof Locations
   */
  static renderTitle(title) {
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${title || 'Location Does Not Have a Name'}`}
      </h2>
    );
  }

  /**
   * @param {UiLocationsValue} location
   * @returns
   * @memberof Locations
   */
  renderLocation(location) {
    if (!location) {
      return null;
    }

    const { plantIds = /** @type string[] */ ([]), _id, title } = location;
    const { length: numPlants } = plantIds;
    const { store: { dispatch } } = this.context;

    return (
      <LocationTile
        _id={_id}
        dispatch={dispatch}
        key={_id}
        numPlants={numPlants}
        title={title}
      />
    );
  }

  /**
   * @param {UiUsersValue|undefined} user
   * @returns
   * @memberof Locations
   */
  renderNoLocations(user) {
    return (
      <div>
        {Locations.renderTitle(user && user.name)}
        <h3 style={{ textAlign: 'center' }}>
          <div style={{ marginTop: '100px' }}>
No locations added yet...
          </div>
          <AddLocationButton
            show={this.isOwner(user)}
            style={{ marginTop: '10px' }}
          />
        </h3>
      </div>
    );
  }

  renderLocations() {
    // eslint-disable-next-line prefer-destructuring, react/destructuring-assignment
    const { store } = /** @type {{store: PlantStore}} */ (this.context);

    const { users, locations } = store.getState();

    const locationsCount = Object.keys(locations || {}).length;

    if (!locations || !locationsCount) {
      return null;
    }

    const { match } = this.props;
    const { params } = match;
    if (params && params.id) {
      const user = users && users[params.id];
      if (user) {
        const { locationIds } = user;
        if (locationIds && locationIds.length) {
          return locationIds.map((locationId) => {
            const location = locations[locationId];
            return this.renderLocation(location);
          });
        }
      }
      return this.renderNoLocations(user);
    }

    // Show only locations with plants (that's the filter()) and then sort
    // by the location with the most plants (that's the sort())
    return Object.values(locations)
      .filter((location) => {
        const { plantIds } = location;
        return plantIds && plantIds.length;
      })
      .sort((a, b) => {
        const sizeA = a.plantIds.length;
        const sizeB = b.plantIds.length;
        return sizeB - sizeA;
      })
      .map(this.renderLocation);
  }

  render() {
    const style = {
      marginTop: '20px',
    };

    return (
      <Base>
        <div style={style}>
          {this.renderLocations()}
        </div>
      </Base>
    );
  }
}

Locations.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      slug: PropTypes.string,
    }),
  }),
};

Locations.defaultProps = {
  match: {
    params: {},
  },
};

// @ts-ignore - TODO: Solve withRouter() param and tsc
module.exports = withRouter(Locations);
