// Used to show a list of locations.
// Url: /locations
// or the locations for a specific user
// Url: /locations/<user-name>/<_user_id>

import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Base from '../base/Base';
import AddLocationButton from './AddLocationButton';
import LocationTile from './LocationTile';
import { LocationProps } from './Location';

class Locations extends React.Component {
  props!: LocationProps;

  unsubscribe!: Function;

  // TODO: When tsc 3.7+ is in use remove the ! to see hint text on how to change this.
  context!: PlantContext;

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
        slug: PropTypes.string,
      }),
    }),
  };

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  static defaultProps = {
    match: {
      params: {},
    },
  };

  constructor(props: LocationProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.renderLocation = this.renderLocation.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context;
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
    const { store } = this.context;
    const { locations, users } = store.getState();
    this.setState({ locations, users });
  }

  isOwner(user?: UiUsersValue) {
    const { store } = this.context;
    const { user: authUser } = store.getState();
    return !!(user && authUser && authUser._id === user._id);
  }

  static renderTitle(title?: string) {
    return (
      <h2 style={{ textAlign: 'center' }}>
        {`${title || 'Location Does Not Have a Name'}`}
      </h2>
    );
  }

  renderLocation(location: UiLocationsValue) {
    if (!location) {
      return null;
    }

    const { plantIds = [], _id, title } = location;
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

  renderNoLocations(user?: UiUsersValue) {
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
    const { store } = this.context;

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

// @ts-ignore - TODO: Solve withRouter() param and tsc
export default withRouter(Locations);
