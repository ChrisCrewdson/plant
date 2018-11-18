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

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
  }

  // eslint-disable-next-line camelcase, react/sort-comp
  UNSAFE_componentWillMount() {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(this.onChange);

    this.onChange();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onChange() {
    const { store } = this.context;
    const state = store.getState();
    const { users, locations } = state;
    this.setState({ users, locations });
  }

  /**
   * Render the users
   * @param {object} user - user is from the users collection and not the loggedIn user
   */
  renderUser(user) {
    const { _id, name: userName, locationIds } = user;
    let link = `/locations/${makeSlug(userName)}/${_id}`;

    if (locationIds.length === 1) {
      const { store } = this.context;
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
    const { store } = this.context;
    const { users } = store.getState();
    if (users && users.length) {
      return users.map(user => this.renderUser(user));
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
