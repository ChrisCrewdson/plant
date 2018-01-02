const { Link } = require('react-router-dom');
const Base = require('./Base');
const React = require('react');
const { isLoggedIn } = require('../../libs/auth-helper');
const PropTypes = require('prop-types');

class Home extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
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
    const { users, locations } = this.context.store.getState();
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
        {existingUsers &&
          <section>
            <Link
              to="/users"
            >
              {'...exlore Farmers and Gardeners...'}
            </Link>
          </section>
        }
        {existingLocations &&
          <section>
            <Link
              to="/locations"
            >
              {'...exlore Orchards, Gardens, Yards and Farms...'}
            </Link>
          </section>
        }
        {!isLoggedIn(store) &&
          <section>
            <div><Link to="/login">Login to get started</Link></div>
          </section>
        }
      </div>
    );
  }

  renderUsers() {
    const { users = {}, locations = {} } = this.context.store.getState();
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
