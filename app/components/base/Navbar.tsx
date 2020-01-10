import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { actionFunc } from '../../actions';
import utils from '../../libs/utils';
import { isLoggedIn } from '../../libs/auth-helper';
import AddPlantButton from '../common/AddPlantButton';
import { UiInterim } from '../../../lib/types/model-iterim';
import { PlantContext } from '../../../lib/types/react-common';

interface NavbarState {
  user: UiUser;
  interimMap: UiInterim;
}

export default class Navbar extends React.Component {
  // TODO: When tsc 3.7+ is in use remove the ! to see hint text on how to change this.
  context!: PlantContext;

  unsubscribe!: Function;

  // eslint-disable-next-line react/state-in-constructor
  state!: NavbarState;

  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor(props: {}) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.logout = this.logout.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount(): void {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);
    const { user = {}, interim: interimMap } = store.getState();
    this.setState({ user, interimMap });
  }

  componentWillUnmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange(): void {
    const { store } = this.context;
    const { user = {}, interim: interimMap } = store.getState();
    this.setState({ user, interimMap });
  }

  logout(): void {
    const { store } = this.context;
    store.dispatch(actionFunc.logoutRequest());
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
  makeMyPlantsMenu(loggedIn: boolean): JSX.Element | null {
    if (!loggedIn) {
      return null;
    }

    const {
      user = {} as UiUser,
    } = this.state || {};

    const locationId = user.activeLocationId
      || (user.locationIds && user.locationIds.length && user.locationIds[0])
      || '';

    if (!locationId) {
      // console.warn('Navbar.makeMyPlantsMenu: No default locationId found for user:', user);
      return null;
    }
    const { store } = this.context;
    const { locations = {} } = store.getState();
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
  }

  // makeLayoutMenu(loggedIn) {
  //   const location = this.getLocation(loggedIn);
  //   if(!location) {
  //     return null;
  //   }

  //   return (
  //     <li>
  //       <Link to={utils.makeLayoutUrl(location)}>Layout Map</Link>
  //     </li>
  //   );
  // }


  render(): JSX.Element {
    const {
      user = {} as UiUser,
      interimMap = {},
    } = this.state || {};
    const { name: userName, _id: userId } = user;
    // if (!userName) {
    //   console.warn('No name found on user object', user);
    // }
    const displayName = userName || 'placeholder-user-name';
    const { store } = this.context;

    const loggedIn = isLoggedIn(store);
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
              {this.makeMyPlantsMenu(loggedIn)}
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
                      <a href="/" onClick={this.logout} title="Logout">
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
}
