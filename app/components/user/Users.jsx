// Used to show a list of users.
// Url: /users

const React = require('react');
const { Link } = require('react-router-dom');
const PropTypes = require('prop-types');
const utils = require('../../libs/utils');
const Base = require('../base/Base');

const { makeSlug } = utils;

class Users extends React.Component {
  static contextTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    store: PropTypes.object.isRequired,
  };

  /**
   * @param {UsersProps} props
   * @memberof Users
   */
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    this.unsubscribe = store.subscribe(this.onChange);

    this.onChange();
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  onChange() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const state = store.getState();
    const { users, locations } = state;
    this.setState({ users, locations });
  }

  /**
   * Render the users
   * @param {UiUsersValue} user - user is from the users collection and not the loggedIn user
   */
  renderUser(user) {
    const { _id, name: userName, locationIds } = user;
    let link = `/locations/${makeSlug(userName)}/${_id}`;

    if (locationIds.length === 1) {
      const { store } = /** @type {{store: PlantStore}} */ (this.context);
      const state = store.getState();
      const { locations } = state;
      if (locations) {
        const [firstLocationId] = locationIds;
        const singleLocation = locations[firstLocationId];
        if (singleLocation) {
          link = `/location/${makeSlug(singleLocation.title)}/${firstLocationId}`;
        }
      }
    }

    return (
      <div key={_id} style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          style={{ margin: '20px' }}
          to={link}
        >
          <span>
            {userName}
          </span>
        </Link>
      </div>
    );
  }

  renderUsers() {
    const { store } = /** @type {{store: PlantStore}} */ (this.context);
    const { users } = store.getState();
    const userIds = Object.keys(users);
    if (userIds.length) {
      return userIds.map(userId => this.renderUser(users[userId]));
    }
    return null;
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

module.exports = Users;
