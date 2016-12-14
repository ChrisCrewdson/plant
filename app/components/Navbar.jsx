const React = require('react');
const store = require('../store');
const actions = require('../actions');
const utils = require('../libs/utils');
const {isLoggedIn} = require('../libs/auth-helper');
const Immutable = require('immutable');
const AddPlantButton = require('./plant/AddPlantButton');

const {Link} = require('react-router');

class Navbar extends React.Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentWillMount() {
    this.unsubscribe = store.subscribe(this.onChange);
    const user = store.getState().get('user', Immutable.Map());
    const interimMap = store.getState().get('interim');
    this.setState({user, interimMap});
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const user = store.getState().get('user', Immutable.Map());
    const interimMap = store.getState().get('interim');
    this.setState({user, interimMap});
  }

  logout() {
    store.dispatch(actions.logout());
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
  makeMyPlantsMenu(loggedIn) {
    if(!loggedIn) {
      return null;
    }

    const {
      user,
    } = this.state || {};

    let locationId = user.get('activeLocationId', '');

    if(!locationId) {
      console.warn('No default locationId found for user', user);
      return null;
    }

    const location = store.getState().getIn(['locations', locationId]);
    if(!location) {
      console.warn('No location found for locationId', locationId);
      return null;
    }

    return (
      <li>
        <Link to={utils.makeLocationUrl(location)} title='My Plants'>My Plants</Link>
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


  render() {
    const {
      user,
      interimMap
    } = this.state || {};
    const displayName = user.get('name', '');

    const loggedIn = isLoggedIn();
    const notEditing = !interimMap.size;

    return (
      <nav className='navbar navbar-default'>
        <div className='container-fluid'>
          <div className='navbar-header'>
            <button type='button' className='navbar-toggle collapsed' data-toggle='collapse' data-target='#plant-navbar-collapse' aria-expanded='false'>
              <span className='sr-only'>Toggle navigation</span>
              <span className='icon-bar' />
              <span className='icon-bar' />
              <span className='icon-bar' />
            </button>
            <Link to={'/'} className='navbar-brand'>Plant</Link>
            <AddPlantButton
              mini={true}
              show={!!(loggedIn && notEditing)}
              style={{marginTop: '5px'}}
            />
          </div>

          <div className='collapse navbar-collapse' id='plant-navbar-collapse'>
            <ul className='nav navbar-nav navbar-right'>
              {this.makeMyPlantsMenu(loggedIn)}
              {loggedIn &&
                <li className='dropdown'>
                  <a href='#' className='dropdown-toggle'
                    data-toggle='dropdown' role='button'
                    aria-haspopup='true' aria-expanded='false'
                    title={displayName}>{displayName} <span className='caret' />
                  </a>
                  <ul className='dropdown-menu'>
                    {/* this.makeLayoutMenu(loggedIn) */}
                    <li>
                      <Link to={'/profile'}>Profile</Link>
                    </li>
                    <li>
                      <a href='#' onClick={this.logout} title='Logout'>Logout</a>
                    </li>
                  </ul>
                </li>
              }
              {!loggedIn &&
                <li>
                  <Link to='/login'>Login</Link>
                </li>
              }
              <li>
                <Link to={'/help'} title='help'>Help</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

module.exports = Navbar;
