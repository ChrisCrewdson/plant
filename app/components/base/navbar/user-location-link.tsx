import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import utils from '../../../libs/utils';
import { PlantStateTree } from '../../../../lib/types/react-common';

interface UserPlantsMenuProps {
  loggedIn: boolean;
  user: UiUser;
}

// When to show the "My Plants" menu and what action to take:
// User is logged in: Always show "My Plants"
// User has zero locations: "My Plants" links to /locations/user-slug/user-id
//   (Allows user to add a location)
//   (Just put a placeholder here for now)
// User has activeLocationId set: "My Plants" links to /location/location-slug/activeLocationId
// User has 1 location. "My Plants" links to /location/location-slug/<single-location-id>
// User has multiple locations: "My Plants" links to /locations/user-slug/user-id
//   (Allows user to pick a location)
//   (Just put a placeholder here for now)
export const UserPlantsMenu = (props: UserPlantsMenuProps): JSX.Element | null => {
  const locations = useSelector((state: PlantStateTree) => state.locations);

  const { loggedIn, user } = props;
  if (!loggedIn) {
    return null;
  }

  const locationId = user.activeLocationId
      || (user.locationIds && user.locationIds.length && user.locationIds[0])
      || '';

  if (!locationId) {
    // console.warn('Navbar.makeMyPlantsMenu: No default locationId found for user:', user);
    return null;
  }
  const location = locations[locationId];
  if (!location) {
    // console.warn('Navbar.makeMyPlantsMenu no location. user, locations:', user, locations);
    return null;
  }
  const locationTitle = location.title || '...';
  const plantListAt = `Plant List at ${locationTitle}`;

  return (
    <li>
      <Link
        to={utils.makeLocationUrl(location)}
        title={plantListAt}
      >
        {plantListAt}
      </Link>
    </li>
  );
};
