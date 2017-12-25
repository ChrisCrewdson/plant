// Used to show a list of locations.
// Url: /locations
// or the locations for a specific user
// Url: /locations/<user-name>/<_user_id>

const actions = require('../../actions');
const Base = require('../base/Base');
const React = require('react');
const { withRouter } = require('react-router-dom');
const AddLocationButton = require('./AddLocationButton');
const PropTypes = require('prop-types');
const LocationTile = require('./LocationTile');

class Locations extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  static renderTitle(title) {
    return (
      <h2 style={{ textAlign: 'center' }}>{`${title}`}</h2>
    );
  }

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  componentWillMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.updateState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onLinkClick(_id) {
    const { store } = this.context || this.contextTypes;
    store.dispatch(actions.changeActiveLocationId({ _id }));
  }

  onChange() {
    this.updateState();
  }

  updateState() {
    const { store } = this.context;
    const { locations, users } = store.getState();
    this.setState({ locations, users });
  }

  isOwner(user) {
    const { store } = this.context;
    const { user: authUser = {} } = store.getState();
    return !!(user && authUser._id === user._id);
  }

  renderLocation(location) {
    if (!location) {
      return null;
    }

    const { plantIds = [], _id, title } = location;
    const { length: numPlants } = plantIds;
    const { store: { dispatch } } = this.context;

    return (<LocationTile
      _id={_id}
      dispatch={dispatch}
      key={_id}
      numPlants={numPlants}
      title={title}
    />);
  }

  renderNoLocations(user) {
    return (
      <div>
        {Locations.renderTitle(user.name)}
        <h3 style={{ textAlign: 'center' }}>
          <div style={{ marginTop: '100px' }}>No locations added yet...</div>
          <AddLocationButton
            show={this.isOwner(user)}
            style={{ marginTop: '10px' }}
          />
        </h3>
      </div>
    );
  }

  renderLocations() {
    const { store } = this.context;
    const { locations, users = {} } = store.getState();
    if (!locations || !locations.length) {
      return null;
    }

    const { params } = this.props.match;
    if (params && params.id) {
      const user = users[params.id] || {};
      const { locationIds = [] } = user;
      if (locationIds.length) {
        return locationIds.map((locationId) => {
          const location = locations[locationId];
          return this.renderLocation(location);
        });
      }
      return this.renderNoLocations(user);
    }
    return locations
      .filter((location) => {
        const { plantIds = [] } = location;
        return !!plantIds.length;
      })
      .sort((a, b) => {
        const sizeA = (a.plantIds || []).length;
        const sizeB = (b.plantIds || []).length;
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

module.exports = withRouter(Locations);
