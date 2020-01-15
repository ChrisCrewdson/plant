// Used to show a list of locations.
// Url: /locations
// or the locations for a specific user
// Url: /locations/<user-name>/<_user_id>

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Base from '../base/Base';
import AddLocationButton from './AddLocationButton';
import LocationTile from './LocationTile';
import { LocationProps } from './Location';
import { PlantStateTree } from '../../../lib/types/react-common';

const renderTitle = (title?: string): JSX.Element => (
  <h2 style={{ textAlign: 'center' }}>
    {`${title || 'Location Does Not Have a Name'}`}
  </h2>
);

export default function Locations(props: LocationProps): JSX.Element {
  const dispatch = useDispatch();
  const locations = useSelector((state: PlantStateTree) => state.locations);
  const users = useSelector((state: PlantStateTree) => state.users);
  const authUser = useSelector((state: PlantStateTree) => state.user);

  const isOwner = (
    user?: UiUsersValue,
  ): boolean => !!(user && authUser && authUser._id === user._id);
  const renderLocation = (location: UiLocationsValue): JSX.Element | null => {
    if (!location) {
      return null;
    }

    const { plantIds = [], _id, title } = location;
    const { length: numPlants } = plantIds;

    return (
      <LocationTile
        _id={_id}
        dispatch={dispatch}
        key={_id}
        numPlants={numPlants}
        title={title}
      />
    );
  };

  const renderNoLocations = (user?: UiUsersValue): JSX.Element => (
    <div>
      {renderTitle(user && user.name)}
      <h3 style={{ textAlign: 'center' }}>
        <div style={{ marginTop: '100px' }}>
No locations added yet...
        </div>
        <AddLocationButton
          show={isOwner(user)}
          style={{ marginTop: '10px' }}
        />
      </h3>
    </div>
  );

  const renderLocations = (): JSX.Element | (JSX.Element | null)[] | null => {
    const locationsCount = Object.keys(locations || {}).length;

    if (!locations || !locationsCount) {
      return null;
    }

    const { match } = props;
    const { params } = match;
    if (params && params.id) {
      const user = users && users[params.id];
      if (user) {
        const { locationIds } = user;
        if (locationIds && locationIds.length) {
          return locationIds.map((locationId) => {
            const location = locations[locationId];
            return renderLocation(location);
          });
        }
      }
      return renderNoLocations(user);
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
      .map(renderLocation);
  };

  const style = {
    marginTop: '20px',
  };

  return (
    <Base>
      <div style={style}>
        {renderLocations()}
      </div>
    </Base>
  );
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
