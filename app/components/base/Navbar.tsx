import React from 'react';
import { Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { actionFunc } from '../../actions';
import utils from '../../libs/utils';
import { isUserLoggedIn } from '../../libs/auth-helper';
import AddPlantButton from '../common/AddPlantButton';
import { PlantStateTree } from '../../../lib/types/react-common';

export default function Navbar(): JSX.Element {
  const dispatch = useDispatch();
  const user = useSelector((state: PlantStateTree) => state.user) || {};
  const interimMap = useSelector((state: PlantStateTree) => state.interim);
  const locations = useSelector((state: PlantStateTree) => state.locations);

  const logout = (): void => {
    dispatch(actionFunc.logoutRequest());
  };

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
  const makeMyPlantsMenu = (loggedIn: boolean): JSX.Element | null => {
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

  const { name: userName, _id: userId } = user;
  const displayName = userName || 'placeholder-user-name';

  const loggedIn = isUserLoggedIn(user);
  const notEditing = !Object.keys(interimMap).length;

  const locationsUrl = `/locations/${utils.makeSlug(displayName)}/${userId}`;

  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#plant-navbar-collapse" aria-expanded="false">
            <span className="sr-only">
Toggle navigation
            </span>
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <Link to="/" className="navbar-brand">
Plant
          </Link>
          <AddPlantButton
            mini
            show={!!(loggedIn && notEditing)}
            style={{ marginTop: '5px' }}
          />
        </div>

        <div className="collapse navbar-collapse" id="plant-navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            {makeMyPlantsMenu(loggedIn)}
            {loggedIn
                && (
                <li className="dropdown">
                  <a
                    href="/"
                    className="dropdown-toggle"
                    data-toggle="dropdown"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                    title={displayName}
                  >
                    {displayName}
                    {' '}
                    <span className="caret" />
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link to={locationsUrl}>
Your Locations
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile">
Profile
                      </Link>
                    </li>
                    <li>
                      <a href="/" onClick={logout} title="Logout">
Logout
                      </a>
                    </li>
                  </ul>
                </li>
                )}
            {!loggedIn
                && (
                <li>
                  <Link to="/login">
Login
                  </Link>
                </li>
                )}
            <li>
              <Link to="/help" title="help">
Help
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
