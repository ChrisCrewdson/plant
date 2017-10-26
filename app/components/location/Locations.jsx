// Used to show a list of locations.
// Url: /locations
// or the locations for a specific user
// Url: /locations/<user-name>/<_user_id>

const actions = require('../../actions');
const Base = require('../base/Base');
const React = require('react');
const { withRouter } = require('react-router-dom');
const Immutable = require('immutable');
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
    const locations = store.getState().get('locations');
    const users = store.getState().get('users');
    this.setState({ locations, users });
  }

  isOwner(user) {
    const { store } = this.context;
    const authUser = store.getState().get('user', Immutable.Map());
    return !!(user && authUser.get('_id') === user.get('_id'));
  }

  renderLocation(location) {
    if (!location) {
      return null;
    }

    const plantIds = location.get('plantIds', Immutable.Set());
    const { size } = plantIds;
    const { store: { dispatch } } = this.context;

    const _id = location.get('_id');
    const title = location.get('title');

    return (<LocationTile
      _id={_id}
      dispatch={dispatch}
      key={_id}
      numPlants={size}
      title={title}
    />);
  }

  renderNoLocations(user) {
    return (
      <div>
        {Locations.renderTitle(user.get('name'))}
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
    const locations = store.getState().get('locations');
    if (!locations || !locations.size) {
      return null;
    }

    const { params } = this.props.match;
    if (params && params.id) {
      const user = store.getState().getIn(['users', params.id], Immutable.Map());
      const locationIds = user.get('locationIds', Immutable.List());
      if (locationIds.size) {
        return locationIds.valueSeq().toArray().map((locationId) => {
          const location = locations.get(locationId);
          return this.renderLocation(location);
        });
      }
      return this.renderNoLocations(user);
    }
    return locations
      .filter((location) => {
        const plantIds = location.get('plantIds', Immutable.Set());
        return plantIds.size > 0;
      })
      .valueSeq()
      .sort((a, b) => {
        const sizeA = a.get('plantIds', Immutable.Set()).size;
        const sizeB = b.get('plantIds', Immutable.Set()).size;
        return sizeB - sizeA;
      })
      .toArray()
      .map(location => this.renderLocation(location));
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
