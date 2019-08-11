const { Link } = require('react-router-dom');
const React = require('react');
const PropTypes = require('prop-types');
const Base = require('./Base');
const { isLoggedIn } = require('../../libs/auth-helper');

class Home extends React.Component {
  // eslint-disable-next-line react/static-property-placement
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { users, locations } = store.getState();
    this.setState({ users, locations });
  }

  /**
   * anonHome
   * @param {boolean} existingUsers
   * @param {boolean} existingLocations
   * @returns {JSX.Element}
   * @memberof Home
   */
  anonHome(existingUsers, existingLocations) {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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
          )}
        {existingLocations
          && (
          <section>
            <Link
              to="/locations"
            >
              {'...explore Orchards, Gardens, Yards and Farms...'}
            </Link>
          </section>
          )}
        {!isLoggedIn(store)
          && (
          <section>
            <div>
              <Link to="/login">
Login to get started
              </Link>
            </div>
          </section>
          )}
      </div>
    );
  }

  renderUsers() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
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
