const { Link } = require('react-router-dom');
const React = require('react');
const PropTypes = require('prop-types');
const Base = require('./Base');
const { isLoggedIn } = require('../../libs/auth-helper');

class Home extends React.Component {
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.updateState();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    this.updateState();
  }

  updateState() {
    const { store } = this.context;
    const { users, locations } = store.getState();
    this.setState({ users, locations });
  }

  anonHome(existingUsers, existingLocations) {
    const { store } = this.context;
    return (
      <div id="hero">
        <section>
          <p>
            {'Improve the health of your trees and plants...'}
          </p>
        </section>
        <section>
          <p>
            {'...measure, compare, and share your awesomeness...'}
          </p>
        </section>
        {existingUsers
          && (
          <section>
            <Link
              to="/users"
            >
              {'...explore Farmers and Gardeners...'}
            </Link>
          </section>
          )
        }
        {existingLocations
          && (
          <section>
            <Link
              to="/locations"
            >
              {'...explore Orchards, Gardens, Yards and Farms...'}
            </Link>
          </section>
          )
        }
        {!isLoggedIn(store)
          && (
          <section>
            <div>
              <Link to="/login">
Login to get started
              </Link>
            </div>
          </section>
          )
        }
      </div>
    );
  }

  renderUsers() {
    const { store } = this.context;
    const { users = {}, locations = {} } = store.getState();
    const usersCount = Object.keys(users).length;
    const locationsCount = Object.keys(locations).length;
    return this.anonHome(!!usersCount, !!locationsCount);
  }

  render() {
    return (
      <Base>
        <div>
          {this.renderUsers()}
        </div>
      </Base>
    );
  }
}

module.exports = Home;
